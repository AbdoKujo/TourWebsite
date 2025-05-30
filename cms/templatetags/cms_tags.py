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
    
    # Special handling for navbar logo
    if element.section and element.section.name == 'navbar_logo':
        # Add spans if not already present
        if '<span>' not in content:
            parts = content.split()
            if len(parts) >= 3:
                # Format: First Second<span>Third</span>
                content = f"{parts[0]}<span>{parts[1]}</span><span>{parts[2]}</span>"
            elif len(parts) == 2:
                # Format: First<span>Second</span>
                content = f"{parts[0]}<span>{parts[1]}</span>"
    
    if edit_mode:
        if element.section and element.section.name == 'navbar_logo':
            return mark_safe(
                f'<div data-editable="logo" data-element-id="{element.id}" '
                f'data-field="{field}">{content}</div>'
            )
        else:
            return mark_safe(
                f'<div data-editable="text" data-element-id="{element.id}" '
                f'data-field="{field}">{content}</div>'
            )
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
    alt = element.title or ""
    
    if edit_mode:
        return mark_safe(f'<div data-editable="image" data-element-id="{element.id}" class="editable-image-container">'
                         f'<img src="{src}" alt="{alt}" class="{css_class}" style="max-width:100%;">'
                         f'</div>')
    else:
        return mark_safe(f'<img src="{src}" alt="{alt}" class="{css_class}">')

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

@register.simple_tag(takes_context=True)
def editable_highlights(context, element):
    """
    Renders trip highlights from JSON content that can be edited in edit mode.
    
    Usage:
    {% editable_highlights element %}
    """
    edit_mode = context.get('edit_mode', False)
    
    if not element:
        return ''
    
    try:
        data = json.loads(element.json_content or '{}')
        highlights = data.get('highlights', [])
    except (ValueError, TypeError):
        highlights = []
    
    if not highlights:
        highlights = [
            'Discover the charm of this destination.',
            'Explore the cultural and spiritual heart of Morocco.',
            'Enjoy excursions through breathtaking landscapes.',
            'Experience local traditions and visit historical landmarks.',
            'Cultural Immersion: Shop in lively souks and visit museums.'
        ]
    
    html = '<ul class="highlights-list">'
    
    for highlight in highlights:
        if edit_mode:
            html += f'<li data-editable="text" data-element-id="{element.id}" data-field="json_content" data-highlight-item="{highlight}">{highlight}</li>'
        else:
            html += f'<li>{highlight}</li>'
    
    html += '</ul>'
    
    return mark_safe(html)

@register.simple_tag(takes_context=True)
def editable_form(context, element):
    """
    Renders a form from JSON content that can be edited in edit mode.
    
    Usage:
    {% editable_form element %}
    """
    edit_mode = context.get('edit_mode', False)
    
    if not element:
        return ''
    
    try:
        data = json.loads(element.json_content or '{}')
        form_data = data.get('form', {})
        fields = form_data.get('fields', [])
        submit_text = form_data.get('submit_text', 'Submit')
        whatsapp_number = form_data.get('whatsapp_number', '212643562320')
    except (ValueError, TypeError):
        fields = []
        submit_text = 'Submit'
        whatsapp_number = '212643562320'
    
    # Wrap the entire form in a div with data-editable="json" when in edit mode
    if edit_mode:
        html = f'<div data-editable="json" data-element-id="{element.id}">'
        html += '<form class="contact-form" onsubmit="sendWhatsApp(); return false;">'
    else:
        html = '<form class="contact-form" onsubmit="sendWhatsApp(); return false;">'
    
    for field in fields:
        field_name = field.get('name', '')
        field_type = field.get('type', 'text')
        field_label = field.get('label', '')
        field_required = field.get('required', False)
        field_options = field.get('options', [])
        
        required_attr = 'required' if field_required else ''
        
        if field_type == 'textarea':
            html += f'<textarea rows="4" class="form-control" id="{field_name}" placeholder="{field_label}" style="resize: none;" {required_attr}></textarea>'
        elif field_type == 'select':
            html += f'<select id="{field_name}" class="form-control" {required_attr}>'
            html += f'<option value="">Select</option>'
            for option in field_options:
                html += f'<option value="{option}">{option}</option>'
            html += '</select>'
        else:
            html += f'<input type="{field_type}" class="form-control" id="{field_name}" placeholder="{field_label}" {required_attr}>'
    
    html += f'<button type="submit" class="btn">{submit_text}</button>'
    html += '</form>'
    
    if edit_mode:
        html += '</div>'
    
    # Add WhatsApp script
    html += f'''
    <script>
    function sendWhatsApp() {{
        let name = document.getElementById("name").value;
        let email = document.getElementById("email").value;
        let message = document.getElementById("message") ? document.getElementById("message").value : "";
        let phone = document.getElementById("phone") ? document.getElementById("phone").value : "";
        let date = document.getElementById("date") ? document.getElementById("date").value : "";
        let guests = document.getElementById("guests") ? document.getElementById("guests").value : "";
        
        let phoneNumber = "{whatsapp_number}";
        let whatsappText = "Name: " + encodeURIComponent(name) + "%0A";
        whatsappText += "Email: " + encodeURIComponent(email) + "%0A";
        
        if (phone) whatsappText += "Phone: " + encodeURIComponent(phone) + "%0A";
        if (date) whatsappText += "Date: " + encodeURIComponent(date) + "%0A";
        if (guests) whatsappText += "Guests: " + encodeURIComponent(guests) + "%0A";
        if (message) whatsappText += "Message: " + encodeURIComponent(message);
        
        let whatsappLink = "https://wa.me/" + phoneNumber + "?text=" + whatsappText;
        window.location.href = whatsappLink;
    }}
    </script>
    '''
    
    return mark_safe(html)

@register.simple_tag(takes_context=True)
def editable_link(context, element, field='src', text_field='title', css_class=''):
    """
    Renders a link that can be edited in edit mode.
    
    Usage:
    {% editable_link element %}
    """
    edit_mode = context.get('edit_mode', False)
    
    if not element:
        return ''
    
    href = getattr(element, field, '#')
    text = getattr(element, text_field, 'Link')
    
    if edit_mode:
        return mark_safe(f'<a href="{href}" class="{css_class}" data-editable="link" data-element-id="{element.id}" data-field="{field}" data-text-field="{text_field}">{text}</a>')
    else:
        return mark_safe(f'<a href="{href}" class="{css_class}">{text}</a>')
