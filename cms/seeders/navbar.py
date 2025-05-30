import json
from django.db import transaction
from cms.models import Page, Section, Element

def seed_navbar():
    """
    Seed the navbar with default navigation items.
    This creates a JSON-based navbar that can be edited through the CMS.
    """
    print("Seeding navbar...")
    
    try:
        # Get or create the home page
        home_page, _ = Page.objects.get_or_create(
            slug='index',
            defaults={
                'name': 'Home',
                'type': 'base'
            }
        )
        
        # Create navbar section if it doesn't exist
        navbar_section, _ = Section.objects.get_or_create(
            name='navbar',
            page=home_page,
            defaults={
                'type': 'navbar',
                'order': 0
            }
        )
        
        # Define default navbar items with CORRECTED URLS
        default_navbar_items = [
            {
                'title': 'Home',
                'src': '/'
            },
            {
                'title': 'Gallery',
                'src': '/page/gallery/'  # Fixed URL
            },
            {
                'title': 'Services',
                'src': '/page/about/'    # Fixed URL
            },
            {
                'title': 'Contact',
                'src': '/page/contact/'  # Fixed URL
            }
        ]
        
        # Check if a navbar element with JSON content already exists
        navbar_element = Element.objects.filter(
            section=navbar_section,
            json_content__isnull=False
        ).exclude(json_content='').first()
        
        if not navbar_element:
            # Create the navbar element with JSON content
            Element.objects.create(
                section=navbar_section,
                title='Navigation Menu',
                json_content=json.dumps(default_navbar_items),
                order=0
            )
            print("Created navbar element with default items")
        else:
            # Update the existing navbar with corrected URLs
            try:
                existing_items = json.loads(navbar_element.json_content)
                for item in existing_items:
                    if item['title'] == 'Gallery':
                        item['src'] = '/page/gallery/'
                    elif item['title'] == 'Services':
                        item['src'] = '/page/about/'
                    elif item['title'] == 'Contact':
                        item['src'] = '/page/contact/'
                
                navbar_element.json_content = json.dumps(existing_items)
                navbar_element.save()
                print("Updated navbar element URLs")
            except:
                print("Could not update existing navbar URLs")
        
        # Create navbar logo element if it doesn't exist
        logo_section, _ = Section.objects.get_or_create(
            name='navbar_logo',
            page=home_page,
            defaults={
                'type': 'text',
                'order': 0
            }
        )
        
        logo_element = Element.objects.filter(section=logo_section).first()
        if not logo_element:
            Element.objects.create(
                section=logo_section,
                title='Marrakech<span>Activities</span><span>Portal</span>',  # Preserve HTML structure
                order=0
            )
            print("Created navbar logo element")
        else:
            # Ensure proper formatting
            content = logo_element.title
            if '<span>' not in content:
                parts = content.split()
                if len(parts) >= 3:
                    # Format: First Second<span>Third</span>
                    formatted = f"{parts[0]}<span>{parts[1]}</span><span>{' '.join(parts[2:])}</span>"
                    logo_element.title = formatted
                    logo_element.save()
                    print("Reformatted existing logo")
            
            print("Navbar logo element already exists")
            
        return True
    
    except Exception as e:
        print(f"Error seeding navbar: {e}")
        return False

if __name__ == "__main__":
    # This allows running the seeder directly
    with transaction.atomic():
        seed_navbar()