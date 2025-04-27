import json
import os
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, Http404
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.views import LoginView
from django.urls import reverse_lazy
from django.conf import settings
from .models import Page, Section, Element, EditHistory
from .forms import ElementForm

# Frontend views
def home(request):
    page = get_object_or_404(Page, slug='index')
    sections = page.sections.all().prefetch_related('elements')
    
    # Organize elements by section
    context = {
        'page': page,
        'edit_mode': request.session.get('edit_mode', False),
    }
    
    # Add elements for each section to the context
    for section in sections:
        elements = section.elements.all()
        if elements:
            context[f'{section.name}_elements'] = elements
            if len(elements) == 1:
                context[f'{section.name}_element'] = elements[0]
    
    return render(request, 'pages/index.html', context)

def page_detail(request, slug):
    page = get_object_or_404(Page, slug=slug)
    sections = page.sections.all().prefetch_related('elements')
    
    # Determine template name
    if page.type == 'base':
        template_name = f'pages/{slug}.html'
    else:
        template_name = 'pages/theme_page.html'
    
    # Organize elements by section
    context = {
        'page': page,
        'edit_mode': request.session.get('edit_mode', False),
    }
    
    # Add elements for each section to the context
    for section in sections:
        elements = section.elements.all()
        if elements:
            context[f'{section.name}_elements'] = elements
            if len(elements) == 1:
                context[f'{section.name}_element'] = elements[0]
    
    return render(request, template_name, context)

# Add this function to your views.py file

def theme_page(request, slug):
    """View for theme pages"""
    page = get_object_or_404(Page, slug=slug, type='theme')
    sections = page.sections.all().prefetch_related('elements')
    
    # Organize elements by section
    context = {
        'page': page,
        'edit_mode': request.session.get('edit_mode', False),
    }
    
    # Add elements for each section to the context
    for section in sections:
        elements = section.elements.all()
        if elements:
            context[f'{section.name}_elements'] = elements
            if len(elements) == 1:
                context[f'{section.name}_element'] = elements[0]
    
    return render(request, 'pages/theme_page.html', context)

# Dashboard views
class AdminLoginView(LoginView):
    template_name = 'dashboard/login.html'
    success_url = reverse_lazy('dashboard')

@login_required
def dashboard(request):
    pages = Page.objects.all()
    recent_edits = EditHistory.objects.all()[:10]
    return render(request, 'dashboard/dashboard.html', {
        'pages': pages,
        'recent_edits': recent_edits,
    })

@login_required
def toggle_edit_mode(request):
    edit_mode = not request.session.get('edit_mode', False)
    request.session['edit_mode'] = edit_mode
    return JsonResponse({'edit_mode': edit_mode})

@login_required
def edit_page(request, page_id):
    page = get_object_or_404(Page, id=page_id)
    sections = page.sections.all().prefetch_related('elements')
    return render(request, 'dashboard/edit_page.html', {
        'page': page,
        'sections': sections,
    })

@login_required
def edit_section(request, section_id):
    section = get_object_or_404(Section, id=section_id)
    elements = section.elements.all()
    return render(request, 'dashboard/edit_section.html', {
        'section': section,
        'elements': elements,
    })

@login_required
@csrf_exempt
def update_element(request, element_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)
    
    element = get_object_or_404(Element, id=element_id)
    
    # Get the field to update
    field = request.POST.get('field')
    if field not in ['title', 'description', 'json_content', 'src']:
        return JsonResponse({'error': 'Invalid field'}, status=400)
    
    # Get the new value
    value = request.POST.get('value', '')
    
    # Save previous value for history
    previous_value = getattr(element, field)
    
    # Update the element
    setattr(element, field, value)
    element.save()
    
    # Record the edit history
    EditHistory.objects.create(
        user=request.user,
        element=element,
        previous_value=previous_value,
        new_value=value,
        field_name=field
    )
    
    return JsonResponse({'success': True})

@login_required
@csrf_exempt
def upload_image(request, element_id):
    if request.method != 'POST' or 'image' not in request.FILES:
        return JsonResponse({'error': 'Invalid request'}, status=400)
    
    element = get_object_or_404(Element, id=element_id)
    
    # Handle file upload
    image = request.FILES['image']
    
    # Create uploads directory if it doesn't exist
    upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save the file
    filename = f"uploads/{image.name}"
    filepath = os.path.join(settings.MEDIA_ROOT, filename)
    
    with open(filepath, 'wb+') as destination:
        for chunk in image.chunks():
            destination.write(chunk)
    
    # Update the element's src field
    previous_src = element.src
    element.src = f"/media/{filename}"
    element.save()
    
    # Record the edit history
    EditHistory.objects.create(
        user=request.user,
        element=element,
        previous_value=previous_src,
        new_value=element.src,
        field_name='src'
    )
    
    return JsonResponse({'success': True, 'src': element.src})
