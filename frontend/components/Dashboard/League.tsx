import Image from "next/image";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/services/Token";
import { IoMdAddCircle } from "react-icons/io";

// points_per_pick = models.IntegerField(default=1)
// points_per_penalty = models.IntegerField(default=1)

type LeagueT = {
    id: number;
    first_league_points: number;
    second_league_points: number;
    third_league_points: number;
    first_league_discount: number;
    second_league_discount: number;
    third_league_discount: number;
    points_per_pick: number;
    points_per_penalty: number;

};

const League = () => {
    const [league, setLeague] = useState<LeagueT>({
        id: 0,
        first_league_points: 0,
        second_league_points: 0,
        third_league_points: 0,
        first_league_discount: 0,
        second_league_discount: 0,
        third_league_discount: 0,
        points_per_pick: 0,
        points_per_penalty: 0
    });

    useEffect(() => {
        fetch('http://localhost:8000/league/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`,
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    console.error(`Error: ${response.status} ${response.statusText}`);
                    return null;
                }
                return response.json(); // Continue if response is OK
            })
            .then((data: LeagueT) => setLeague(data));
    }, []);

    const handleInputChange = (field: keyof LeagueT, value: number) => {
        setLeague((prev) => ({ ...prev, [field]: value }));
    };

    const handleUpdate = () => {
        fetch(`http://localhost:8000/league/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getAccessToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(league),
        })
            .then((response) => {
                if (!response.ok) {
                    console.error(`Error: ${response.status} ${response.statusText}`);
                    return null;
                }
                return response.json();
            })
            .then((data) => {
                console.log('League updated successfully:', data);
            })
            .catch((error) => console.error('Error updating league:', error));
    };

    return (
        <div className="rounded-[10px] bg-white px-7.5 pt-7.5 shadow-1 shadow-md pt-5 w-full ">
            <div className="relative flex w-full justify-center">
                <h4 className="mb-8 text-center font-bold text-dark ">Leagues</h4>
            </div>

            <div className="grid grid-cols-12 w-full justify-between">
                {/* Iron League */}
                <div className="col-span-12 sm:col-span-4 flex flex-col items-center justify-between">
                    <h5 className="font-bold">Iron</h5>
                    <Image width={180} height={180} src="/iron.png" alt="Iron league" />
                    <div className="flex flex-col">
                        <div className="flex flex-col mx-3 items-center">
                            <p className="text-sm px-4 font-bold font-sans">Points needed</p>
                            <input
                                type="number"
                                className="m-4 text-lg border-black border"
                                value={league.first_league_points}
                                onChange={(e) =>
                                    handleInputChange('first_league_points', Number(e.target.value))
                                }
                            />
                        </div>
                        <div className="flex flex-col mx-3 items-center">
                            <p className="text-sm px-4 font-bold font-sans">
                                Discount percentage
                            </p>
                            <input
                                type="number"
                                className="m-4 text-lg border-black border"
                                value={league.first_league_discount}
                                onChange={(e) =>
                                    handleInputChange('first_league_discount', Number(e.target.value))
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Gold League */}
                <div className="col-span-12 sm:col-span-4 flex flex-col items-center justify-between">
                    <h5 className="font-bold">Gold</h5>
                    <Image width={180} height={180} src="/gold.png" alt="Gold league" />
                    <div className="flex flex-col">
                        <div className="flex flex-col mx-3 items-center">
                            <p className="text-sm px-4 font-bold font-sans">Points needed</p>
                            <input
                                type="number"
                                className="m-4 text-lg border-black border"
                                value={league.second_league_points}
                                onChange={(e) =>
                                    handleInputChange('second_league_points', Number(e.target.value))
                                }
                            />
                        </div>
                        <div className="flex flex-col mx-3 items-center">
                            <p className="text-sm px-4 font-bold font-sans">
                                Discount percentage
                            </p>
                            <input
                                type="number"
                                className="m-4 text-lg border-black border"
                                value={league.second_league_discount}
                                onChange={(e) =>
                                    handleInputChange('second_league_discount', Number(e.target.value))
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Diamond League */}
                <div className="col-span-12 sm:col-span-4 flex flex-col items-center justify-between">
                    <h5 className="font-bold">Diamond</h5>
                    <Image
                        width={180}
                        height={180}
                        src="/diamond.png"
                        alt="Diamond league"
                    />
                    <div className="flex flex-col">
                        <div className="flex flex-col mx-3 items-center">
                            <p className="text-sm px-4 font-bold font-sans">Points needed</p>
                            <input
                                type="number"
                                className="m-4 text-lg border-black border"
                                value={league.third_league_points}
                                onChange={(e) =>
                                    handleInputChange('third_league_points', Number(e.target.value))
                                }
                            />
                        </div>
                        <div className="flex flex-col mx-3 items-center">
                            <p className="text-sm px-4 font-bold font-sans">
                                Discount percentage
                            </p>
                            <input
                                type="number"
                                className="m-4 text-lg border-black border"
                                value={league.third_league_discount}
                                onChange={(e) =>
                                    handleInputChange('third_league_discount', Number(e.target.value))
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>


            <div className="flex justify-between mt-8 ">
                <div className="flex flex-col mx-3 items-center">
                    <p className="text-sm px-4">
                        Points per pickup
                    </p>
                    <input type="number"
                        value={league.points_per_pick}
                        onChange={(e) =>
                            handleInputChange('points_per_pick', Number(e.target.value))
                        }
                        className="m-4 text-lg w-[50px] border border-black" />
                </div>

                <div className="flex justify-between mt-8 ">
                    <button
                        type="submit"
                        onClick={handleUpdate}
                        className="flex h-[38px] sm:w-[70px] border border-black justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-white transition-colors hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                        Update
                    </button>
                </div>

                <div className="flex flex-col mx-3 items-center">
                    <p className="text-sm px-4">
                        Penalty points
                    </p>
                    <input type="number"
                        value={league.points_per_penalty}
                        onChange={(e) =>
                            handleInputChange('points_per_penalty', Number(e.target.value))
                        }
                        className="m-4 text-lg w-[50px] border border-black" />
                </div>
            </div>

        </div>
    );
};

export default League;
