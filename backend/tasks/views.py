from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import date
from .models import Task
from .serializers import TaskSerializer
from core.utils import log_activity, create_notification

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'assigned_to']
    ordering_fields = ['due_date', 'priority', 'status', 'created_at']
    ordering = ['due_date', '-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)

        overdue = self.request.query_params.get('overdue')
        if overdue == 'true':
            queryset = queryset.exclude(status='completed').filter(due_date__lt=date.today())

        return queryset

    def perform_create(self, serializer):
        task = serializer.save()
        log_activity(
            action_type="task_created",
            entity_type="task",
            entity_id=task.id,
            title=f"Task Created: {task.title}",
            description=f"Assigned to {task.assigned_to} with {task.get_priority_display()} priority."
        )

    def perform_update(self, serializer):
        task = serializer.save()
        if task.status == 'completed':
            log_activity(
                action_type="task_completed",
                entity_type="task",
                entity_id=task.id,
                title=f"Task Completed: {task.title}",
                description=f"Marked completed by {task.assigned_to}."
            )
            create_notification(
                title="Task Completed",
                message=f"'{task.title}' has been finished.",
                notification_type="success",
                entity_type="task",
                entity_id=task.id
            )
        else:
            log_activity(
                action_type="task_updated",
                entity_type="task",
                entity_id=task.id,
                title=f"Task Updated: {task.title}",
                description=f"Task details updated."
            )

    def perform_destroy(self, instance):
        title = instance.title
        t_id = instance.id
        instance.delete()
        log_activity(
            action_type="task_deleted",
            entity_type="task",
            entity_id=t_id,
            title=f"Task Removed: {title}",
            description=f"Task '{title}' was deleted."
        )

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = dict(Task.STATUS_CHOICES).keys()

        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Allowed values: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        task.status = new_status
        task.save()

        if new_status == 'completed':
            log_activity(
                action_type="task_completed",
                entity_type="task",
                entity_id=task.id,
                title=f"Task Completed: {task.title}",
                description=f"Task marked as completed."
            )
            create_notification(
                title="Task Completed",
                message=f"'{task.title}' completed.",
                notification_type="success",
                entity_type="task",
                entity_id=task.id
            )

        return Response(TaskSerializer(task).data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(status='completed').count()
        pending_tasks = total_tasks - completed_tasks
        overdue_tasks = Task.objects.exclude(status='completed').filter(due_date__lt=date.today()).count()

        return Response({
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'pending_tasks': pending_tasks,
            'overdue_tasks': overdue_tasks,
        })
