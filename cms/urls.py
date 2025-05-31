from django.urls import path
from . import views

urlpatterns = [
    # Frontend URLs
    path('', views.home, name='home'),
    path('page/<slug:slug>/', views.page_detail, name='page_detail'),
    path('theme/<slug:slug>/', views.theme_page, name='theme_page'),
    
    # Dashboard URLs
    path('dashboard/', views.dashboard, name='dashboard'),
    path('dashboard/login/', views.AdminLoginView.as_view(), name='admin_login'),
    path('dashboard/toggle-edit-mode/', views.toggle_edit_mode, name='toggle_edit_mode'),
    path('dashboard/page/<int:page_id>/', views.edit_page, name='edit_page'),
    path('dashboard/section/<int:section_id>/', views.edit_section, name='edit_section'),
    path('dashboard/element/<int:element_id>/update/', views.update_element, name='update_element'),
    path('dashboard/element/<int:element_id>/upload-image/', views.upload_image, name='upload_image'),
    path('dashboard/element/<int:element_id>/get/', views.get_element, name='get_element'),
    path('dashboard/element/<int:element_id>/upload_video/', views.upload_video, name='upload_video'),
    path('dashboard/element/<int:element_id>/delete/', views.delete_element, name='delete_element'),
]
