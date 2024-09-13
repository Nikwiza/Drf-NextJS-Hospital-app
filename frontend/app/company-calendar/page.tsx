"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { redirect } from "next/navigation";

import 'react-big-calendar/lib/css/react-big-calendar.css';
import {Calendar as BigCalendar, momentLocalizer, Views} from 'react-big-calendar'
import moment from "moment";
import { getAccessToken } from "@/services/Token";

const localizer = momentLocalizer(moment)

interface SimpleUser {
  id: number;
  name: string;
}

interface SimpleEquipment {
  id: number;
  equipment_name: string;
  equipment_type: string;
}

interface EventItem {
  start: Date;
  end: Date;
  name: string;
  date:string;
  time:string;
  duration:string;
  is_expired: boolean;
  is_picked_up: boolean;
}

interface Reservation {
    id:number;
    administrator:{
      id: number;
      account:SimpleUser;
    }
    company:number;
    date:string;
    time:string;
    duration:string;
    reserved_by:SimpleUser;
    is_expired: boolean;
    is_picked_up: boolean;
    reserved_equipment?: SimpleEquipment;
  };


const CalendarPage = () => {

  const [view, setView] = useState<any>(Views.MONTH);
  const [eventList, setEventList] = useState<Reservation[]>([]);

  const [date, setDate] = useState(
    new Date().toISOString().substring(0, 10).replace(/-/g, "-")
);

useEffect(() => {


  fetch('http://localhost:8000/company/company-calendar/', 
    {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json',
      },
  }
  )
    .then((response) => {
      if (!response.ok){
        return []
      }
      return response.json()
    })
    .then((data: Reservation[]) =>
      setEventList(data)
    );
}, []);


const eventListTransformed = useMemo(() => {
  if (!eventList){
    return []
  }
  return eventList.map((reservation) => {
    const { date, time, duration } = reservation;

    const start = new Date(`${date}T${time}`);

    const [hours, minutes, seconds] = duration.split(":").map(Number);
    const end = new Date(start);
    end.setHours(end.getHours() + hours);
    end.setMinutes(end.getMinutes() + minutes);
    end.setSeconds(end.getSeconds() + seconds);

    return {
      start,
      end,
      name: reservation.administrator.account.name,
      is_expired:reservation.is_expired,
      is_picked_up:reservation.is_picked_up,
      date,
      time,
      duration,
    };
  });
}, [eventList]);

const handleCalendarNavigate = (date:Date) => {

    const formattedDate = date.toISOString().substring(0, 10).replace(/-/g, "-");
    setDate((prevDate) => {return formattedDate});
};

  const initProps = {
    localizer: localizer,
    defaultView: Views.MONTH,
    max: moment("2022-10-10T16:00:00").toDate(),
    min: moment("2022-10-10T08:00:00").toDate(),
    step: 15,
    timeslots: 4,
  }; 

    return (
        <>
        <div className="mt-5 h-[85vh]">
        <BigCalendar
          localizer={localizer}
          events={eventListTransformed}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          view={view}
          date={date}
          onView={(view) => setView(view)}
          onNavigate={handleCalendarNavigate}
          components={{
            event: ({ event }: { event: EventItem }) => (
              <div className={`p-2 text-sm ${event.is_picked_up && 'bg-green-600'} ${event.is_expired && 'bg-red-600'}`}>
                <ul>
                  <li><b>User: </b>{event.name}</li>
                  <li><b>Start: </b>{event.date}</li>
                  <li><b>Duration: </b>{event.duration}</li>
                </ul>
              </div>
            ),
          }}
/>

        </div>
        </>
    )
};

export default CalendarPage;