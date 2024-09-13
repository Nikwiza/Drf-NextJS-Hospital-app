from django.db import models


class Comment(models.Model):
    comment = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment {self.id} - {self.comment[:20]}"


class Complaint(models.Model):
    reserved_by = models.ForeignKey(
        "companies.PickupSlot",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="complained_slot",
    )
    comments = models.ManyToManyField(Comment, related_name="complaints")

    def __str__(self):
        return f"Complaint for PickupSlot {self.reserved_by} with {self.comments.count()} comments"


class UserComplaint(models.Model):
    reservation = models.ForeignKey(
        "companies.PickupSlot",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="user_coplaint_slog",
    )
    comments = models.ForeignKey(
        "complaints.Comment", on_delete=models.CASCADE, related_name="comment_complaint"
    )
    admin_answer = models.ForeignKey(
        "complaints.Comment",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
