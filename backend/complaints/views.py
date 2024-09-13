from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Prefetch
from rest_framework import status
from .models import Complaint, UserComplaint, Comment
from companies.models import PickupSlot
from .serializers import GroupedPickupSlotSerializer, ComplaintSerializer, ComplaintUserSerializer
from rest_framework import generics
from user.models import Account
from django.db import transaction
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from profiles.permissions import IsSystemAdmin


class GetComplaintView(generics.ListAPIView):
    queryset = UserComplaint.objects.filter(admin_answer = None)
    serializer_class = ComplaintUserSerializer


class ComplaintGroupedByUserView(APIView):

    def get(self, request):

        users_with_complaints = Account.objects.filter(reserved_slots__complained_slot__isnull=False).distinct()
        
        serializer = GroupedPickupSlotSerializer(users_with_complaints, many=True)
        
        return Response(serializer.data)
    
class UpdateAdminAnswerView(APIView):

    permission_classes = [IsSystemAdmin]  
    @transaction.atomic
    def post(self, request):

        complaint_id = request.data.get('complaint_id')
        admin_answer_text = request.data.get('admin_answer')

        if not complaint_id or not admin_answer_text:
            return Response({"error": "Both 'complaint_id' and 'admin_answer' are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        complaint = get_object_or_404(UserComplaint, id=complaint_id)

        if complaint.admin_answer:
            return Response({"error": "This complaint has already been answered."}, status=status.HTTP_400_BAD_REQUEST)

        admin_answer_comment = Comment.objects.create(comment=admin_answer_text)

        with transaction.atomic():
            complaint.admin_answer = admin_answer_comment
            complaint.save()

        serializer = ComplaintSerializer(complaint)
        return Response(serializer.data, status=status.HTTP_200_OK)