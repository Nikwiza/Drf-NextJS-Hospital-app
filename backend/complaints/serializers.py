from rest_framework import serializers
from .models import Complaint, Comment, UserComplaint
from companies.serializers import SimpleAccountSerializer
from companies.models import PickupSlot
from user.models import Account

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'comment', 'created_at']


class ComplaintSerializer(serializers.ModelSerializer):
    comments = CommentSerializer() 
    admin_answer = CommentSerializer() 

    class Meta:
        model = UserComplaint
        fields = ['id', 'reservation', 'comments', 'admin_answer']

class ComplaintUserSerializer(serializers.ModelSerializer):

    comments = serializers.CharField(source='comments.comment')
    commented_at = serializers.DateTimeField(source='comments.created_at')
    admin_answer = serializers.CharField(source='admin_answer.comment', allow_null=True)
    
    # Fields to include the user information tied to the reservation
    user_id = serializers.IntegerField(source='reservation.reserved_by.id', read_only=True)
    user_name = serializers.CharField(source='reservation.reserved_by.name', read_only=True)
    user_email = serializers.EmailField(source='reservation.reserved_by.email', read_only=True)

    class Meta:
        model = UserComplaint
        fields = ['id', 'comments', 'admin_answer', 'user_id', 'user_name', 'user_email', 'commented_at']


class GroupedPickupSlotSerializer(serializers.ModelSerializer):
    complaints = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ['id', 'email', 'name', 'complaints']

    def get_complaints(self, obj):
        # Get all complaints made by this user
        complaints = UserComplaint.objects.filter(reservation__reserved_by=obj)
        return ComplaintSerializer(complaints, many=True).data