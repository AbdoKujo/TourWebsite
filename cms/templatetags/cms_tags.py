from django import template
from django.utils.safestring import mark_safe
import json

register = template.Library()

@register.simple_tag(takes_context=True)
def editable_text(context, element, field='description'):
    """
    Renders text content that can be edited in edit mode.
    
    Usage:
    {% editable_text element 'title' %}
    """
    edit_mode = context.get('edit_mode', False)
    
    if not element:
        return ''
    
    content = getattr(element, field, '')
    
    if edit_mode:
        return mark_safe(f'<div data-editable="text" data-element-id="{element.id}" data-field="{field}">{content}</div>')
    else:
        return mark_safe(content)

@register.simple_tag(takes_context=True)
def editable_image(context, element, css_class=''):
    """
    Renders an image that can be edited in edit mode.
    
    Usage:
    {% editable_image element 'img-fluid' %}
    """
    edit_mode = context.get('edit_mode', False)
    
    if not element:
        return ''
    
    src = element.src or '/static/images/placeholder.svg'
    
    if edit_mode:
        return mark_safe(f'<div data-editable="image" data-element-id="{element.id}" class="{css_class}">'
                         f'<img src="{src}" alt="{element.title or ""}" class="{css_class}">'
                         f'</div>')
    else:
        return mark_safe(f'<img src="{src}" alt="{element.title or ""}" class="{css_class}">')

@register.simple_tag(takes_context=True)
def editable_video(context, element, css_class=''):
    """
    Renders a video that can be edited in edit mode.
    
    Usage:
    {% editable_video element 'video-fluid' %}
    """
    edit_mode = context.get('edit_mode', False)
    
    if not element:
        return ''
    
    src = element.src or ''
    
    if edit_mode:
        return mark_safe(f'<div data-editable="video" data-element-id="{element.id}" data-src="{src}" class="{css_class}">'
                         f'<video controls class="{css_class}"><source src="{src}" type="video/mp4">Your browser does not support the video tag.</video>'
                         f'</div>')
    else:
        return mark_safe(f'<video controls class="{css_class}"><source src="{src}" type="video/mp4">Your browser does not support the video tag.</video>')

@register.simple_tag(takes_context=True)
def editable_json(context, element, template_name=None):
    """
    Renders JSON content using a specified template.
    
    Usage:
    {% editable_json element 'templates/json/footer.html' %}
    """
    edit_mode = context.get('edit_mode', False)
    
    if not element:
        return ''
    
    json_content = element.json_content or '{}'
    
    try:
        data = json.loads(json_content)
    except json.JSONDecodeError:
        data = {}
    
    if template_name:
        from django.template.loader import render_to_string
        rendered = render_to_string(template_name, {'data': data, 'element': element, 'edit_mode': edit_mode})
        return mark_safe(rendered)
    
    # If no template specified, just return the JSON as a string
    if edit_mode:
        return mark_safe(f'<div data-editable="json" data-element-id="{element.id}">{json_content}</div>')
    else:
        return mark_safe(json_content)

@register.filter
def json_parse(value):
    """Parse JSON string into Python object"""
    if not value:
        return {}
    try:
        return json.loads(value)
    except (ValueError, TypeError):
        return {}
