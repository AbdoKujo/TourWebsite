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

# Add this function to your views.py file to get footer elements for all pages
def get_footer_elements():
    """Get footer elements to be used across all pages"""
    try:
        # Try to get the footer section from the home page first
        home_page = Page.objects.get(slug='index')
        footer_section = home_page.sections.filter(name='footer').first()
        if footer_section:
            return footer_section.elements.all()
    except (Page.DoesNotExist, AttributeError):
        pass
    
    # If not found, try to find any footer section
    footer_section = Section.objects.filter(name='footer').first()
    if footer_section:
        return footer_section.elements.all()
    
    # Return empty queryset if no footer elements found
    return Element.objects.none()

# Add this function to get navbar elements for all pages
def get_navbar_elements():
    """Get navbar elements to be used across all pages"""
    # Initialize result dictionary
    result = {}
    
    try:
        # Try to get the navbar section from the home page first
        home_page = Page.objects.get(slug='index')
        
        # Get navbar section
        navbar_section = home_page.sections.filter(name='navbar').first()
        if navbar_section:
            # First check for a JSON-based navbar element
            navbar_element = navbar_section.elements.filter(
                json_content__isnull=False
            ).exclude(json_content='').first()
            
            if navbar_element:
                result['navbar_element'] = navbar_element
            else:
                # If no JSON navbar, get individual elements
                elements = navbar_section.elements.all().order_by('order')
                if elements.exists():
                    result['navbar_elements'] = elements
        
        # Always try to get the navbar logo element
        logo_section = home_page.sections.filter(name='navbar_logo').first()
        if logo_section:
            logo_element = logo_section.elements.first()
            if logo_element:
                result['navbar_logo_element'] = logo_element
        
        return result
    
    except (Page.DoesNotExist, AttributeError):
        pass
    
    # Return empty dict if nothing found
    return {}

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
    
    # Add footer elements to context
    context['footer_elements'] = get_footer_elements()
    
    # Add navbar elements to context
    context.update(get_navbar_elements())
    
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
    
    # Add footer elements to context
    context['footer_elements'] = get_footer_elements()
    
    # Add navbar elements to context
    context.update(get_navbar_elements())
    
    return render(request, template_name, context)

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
    
    # Add footer elements to context
    context['footer_elements'] = get_footer_elements()
    
    # Add navbar elements to context
    context.update(get_navbar_elements())
    
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
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'add_section':
            # Create a new section
            name = request.POST.get('name')
            section_type = request.POST.get('type')
            order = request.POST.get('order', 0)
            
            Section.objects.create(
                page=page,
                name=name,
                type=section_type,
                order=order
            )
            return redirect('edit_page', page_id=page.id)
        else:
            # Update page details
            page.name = request.POST.get('name', page.name)
            page.type = request.POST.get('type', page.type)
            page.slug = request.POST.get('slug', page.slug)
            page.save()
            return redirect('edit_page', page_id=page.id)
    
    return render(request, 'dashboard/edit_page.html', {
        'page': page,
        'sections': sections,
    })

@login_required
def edit_section(request, section_id):
    section = get_object_or_404(Section, id=section_id)
    elements = section.elements.all()
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'add_element':
            # Create a new element
            title = request.POST.get('title', '')
            description = request.POST.get('description', '')
            json_content = request.POST.get('json_content', '')
            src = request.POST.get('src', '')
            order = request.POST.get('order', 0)
            
            # Handle file upload
            file = request.FILES.get('file')
            if file:
                upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
                os.makedirs(upload_dir, exist_ok=True)
                
                filename = f"uploads/{file.name}"
                filepath = os.path.join(settings.MEDIA_ROOT, filename)
                
                with open(filepath, 'wb+') as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)
                
                src = f"/media/{filename}"
            
            Element.objects.create(
                section=section,
                title=title,
                description=description,
                json_content=json_content,
                src=src,
                order=order
            )
            return redirect('edit_section', section_id=section.id)
        else:
            # Update section details
            section.name = request.POST.get('name', section.name)
            section.type = request.POST.get('type', section.type)
            section.order = request.POST.get('order', section.order)
            section.save()
            return redirect('edit_section', section_id=section.id)
    
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
def get_element(request, element_id):
    """Get element data for editing"""
    element = get_object_or_404(Element, id=element_id)
    
    return JsonResponse({
        'id': element.id,
        'title': element.title,
        'description': element.description,
        'json_content': element.json_content,
        'src': element.src,
        'order': element.order
    })

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

@login_required
@csrf_exempt
def upload_video(request, element_id):
    if request.method != 'POST' or 'video' not in request.FILES:
        return JsonResponse({'error': 'Invalid request'}, status=400)
    
    element = get_object_or_404(Element, id=element_id)
    
    # Handle file upload
    video = request.FILES['video']
    
    # Validate video file
    if not video.content_type.startswith('video/'):
        return JsonResponse({'error': 'File must be a video'}, status=400)
    
    # Create uploads directory if it doesn't exist
    upload_dir = os.path.join(settings.MEDIA_ROOT, 'videos')
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save the file
    filename = f"videos/{video.name}"
    filepath = os.path.join(settings.MEDIA_ROOT, filename)
    
    with open(filepath, 'wb+') as destination:
        for chunk in video.chunks():
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
