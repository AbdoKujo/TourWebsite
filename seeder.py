#!/usr/bin/env python
import os
import django
import json
from pathlib import Path

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'website_cms.settings')
django.setup()

from django.utils.text import slugify
from cms.models import Page, Section, Element
from django.contrib.auth.models import User

def create_superuser():
    """Create a superuser if one doesn't exist"""
    if not User.objects.filter(is_superuser=True).exists():
        User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpassword'
        )
        print("Created superuser 'admin' with password 'adminpassword'")
    else:
        print("Superuser already exists")

def clear_database():
    """Clear existing data"""
    Element.objects.all().delete()
    Section.objects.all().delete()
    Page.objects.all().delete()
    print("Database cleared")

def create_base_pages():
    """Create base pages: Home, Services, Gallery, Contact"""
    # Create Home page
    home_page = Page.objects.create(
        slug='index',
        name='Home',
        type='base'
    )
    print(f'Created Home page')
    create_home_page_sections(home_page)
    
    # Create Services page
    about_page = Page.objects.create(
        slug='about',
        name='Services',
        type='base'
    )
    print(f'Created Services page')
    create_about_page_sections(about_page)
    
    # Create Gallery page
    gallery_page = Page.objects.create(
        slug='gallery',
        name='Gallery',
        type='base'
    )
    print(f'Created Gallery page')
    create_gallery_page_sections(gallery_page)
    
    # Create Contact page
    contact_page = Page.objects.create(
        slug='contact',
        name='Contact',
        type='base'
    )
    print(f'Created Contact page')
    create_contact_page_sections(contact_page)

def create_theme_pages():
    """Create theme pages for different destinations"""
    theme_pages = [
        'Tangier', 'Essaouira', 'Merzouga', 'Ouzoud', 'Ourika', 
        'Agafay', 'LaPalmeraie', 'HotAirBalloon', 'ParaglidingAguergour', 'Imlil', 'Immobilier'
    ]
    
    for page_name in theme_pages:
        slug = slugify(page_name)
        page = Page.objects.create(
            slug=slug,
            name=page_name,
            type='theme'
        )
        print(f'Created Theme page: {page_name}')
        create_theme_page_sections(page)

def create_home_page_sections(page):
    """Create sections for the Home page"""
    # Create Header section
    header_section = Section.objects.create(
        page=page,
        name='header',
        type='text',
        order=0
    )
    
    # Create Header elements
    Element.objects.create(
        section=header_section,
        title='Leave Your Footprints',
        description='Discover the magic of Morocco, a land of breathtaking landscapes, rich culture, and unforgettable adventures. From the golden dunes of the Sahara to the vibrant souks of Marrakech, explore ancient medinas, majestic mountains, and stunning coastal towns. Experience the warmth of Moroccan hospitality, savor traditional cuisine, and embark on a journey full of history, adventure, and beauty.',
        order=0
    )
    
    # Create Featured section
    featured_section = Section.objects.create(
        page=page,
        name='featured',
        type='image',
        order=1
    )
    
    # Create Featured elements
    featured_items = [
        {
            'title': 'Agafay Desert',
            'src': '/static/images/Agafay2.jpg',
            'order': 0
        },
        {
            'title': 'Ourika',
            'src': '/static/images/Ourika6.jpg',
            'order': 1
        },
        {
            'title': 'Parapont',
            'src': '/static/images/parapont1.jpg',
            'order': 2
        },
        {
            'title': 'Ouzoud',
            'src': '/static/images/Ouzoud2.jpg',
            'order': 3
        },
        {
            'title': 'Air Balloon',
            'src': '/static/images/AirBallon2.jpg',
            'order': 4
        },
        {
            'title': 'Imlil',
            'src': '/static/images/imlil3.jpg',
            'order': 5
        }
    ]
    
    for item in featured_items:
        Element.objects.create(
            section=featured_section,
            title=item['title'],
            src=item['src'],
            order=item['order']
        )
    
    # Create Services section
    services_section = Section.objects.create(
        page=page,
        name='services',
        type='text',
        order=2
    )
    
    # Create Services elements
    services_items = [
        {
            'title': 'Luxury Stay',
            'description': 'Relax in stylish desert lodges and enjoy breathtaking Agafay views.',
            'json_content': 'fas fa-hotel',
            'order': 0
        },
        {
            'title': 'Expert Travel Guide',
            'description': 'Explore Morocco with experienced guides for an unforgettable journey.',
            'json_content': 'fas fa-map-marked-alt',
            'order': 1
        },
        {
            'title': 'Best Prices Guaranteed',
            'description': 'Enjoy top-tier services at the most competitive rates.',
            'json_content': 'fas fa-money-bill',
            'order': 2
        }
    ]
    
    for item in services_items:
        Element.objects.create(
            section=services_section,
            title=item['title'],
            description=item['description'],
            json_content=item['json_content'],
            order=item['order']
        )
    
    # Create Testimonials section
    testimonials_section = Section.objects.create(
        page=page,
        name='testimonials',
        type='text',
        order=3
    )
    
    # Create Testimonials elements
    testimonials_items = [
        {
            'title': 'Kevin Wilson',
            'description': 'An unforgettable experience! The views, the hospitality, and the adventure made our trip magical.',
            'src': '/static/images/test-1.jpg',
            'order': 0
        },
        {
            'title': 'Ben Davis',
            'description': 'Absolutely breathtaking! The desert, the food, and the peaceful vibes were beyond expectations.',
            'src': '/static/images/test-2.jpg',
            'order': 1
        },
        {
            'title': 'Jaura Jones',
            'description': 'A perfect escape! Loved the camel rides, the starry nights, and the warm hospitality.',
            'src': '/static/images/test-3.jpg',
            'order': 2
        }
    ]
    
    for item in testimonials_items:
        Element.objects.create(
            section=testimonials_section,
            title=item['title'],
            description=item['description'],
            src=item['src'],
            order=item['order']
        )
    
    # Create Video section
    video_section = Section.objects.create(
        page=page,
        name='video',
        type='video',
        order=4
    )
    
    # Create Video element
    Element.objects.create(
        section=video_section,
        src='/static/videos/video-section.mp4',
        order=0
    )

def create_about_page_sections(page):
    """Create sections for the Services (About) page"""
    # Create Header section
    header_section = Section.objects.create(
        page=page,
        name='header',
        type='text',
        order=0
    )
    
    # Create Header elements
    Element.objects.create(
        section=header_section,
        title='Services',
        description='Escape to the stunning Agafay Desert, a hidden gem near Marrakech. Experience breathtaking landscapes, luxury desert camps, and unforgettable adventures under the starry sky. Discover the magic of Agafay today!',
        order=0
    )
    
    # Create About section
    about_section = Section.objects.create(
        page=page,
        name='about',
        type='image',
        order=1
    )
    
    # Create About elements
    about_items = [
        {
            'title': 'Ouzoud',
            'description': 'Experience the breathtaking beauty of Ouzoud Waterfalls, where cascading waters and lush landscapes create the perfect escape into nature.',
            'src': '/static/images/Ouzoud8.jpg',
            'json_content': '{"link": "theme/ouzoud", "link_text": "Read More"}',
            'order': 0
        },
        {
            'title': 'La Palmeraie',
            'description': 'Experience the beauty of Marrakech\'s palm groves with a serene camel ride, immersing yourself in nature and tradition.',
            'src': '/static/images/LaPalmaraie9.jpg',
            'json_content': '{"link": "theme/lapalmeraie", "link_text": "Read More"}',
            'order': 1
        },
        {
            'title': 'Agafay',
            'description': 'Explore the vibrant streets of Marrakech, from the bustling souks to the stunning palaces, and immerse yourself in the heart of Moroccan culture.',
            'src': '/static/images/Agafay8.jpg',
            'json_content': '{"link": "theme/agafay", "link_text": "Read More"}',
            'order': 2
        },
        {
            'title': 'Ourika',
            'description': 'Escape to the serene Ourika Valley, where lush greenery, Berber villages, and refreshing waterfalls await just outside Marrakech.',
            'src': '/static/images/Ourika8.jpg',
            'json_content': '{"link": "theme/ourika", "link_text": "Read More"}',
            'order': 3
        },
        {
            'title': 'Essaouira',
            'description': 'Breathe in the fresh ocean air as you wander through Essaouira\'s charming medina, discovering its rich history and coastal beauty.',
            'src': '/static/images/assaouira7.jpg',
            'json_content': '{"link": "theme/essaouira", "link_text": "Read More"}',
            'order': 4
        },
        {
            'title': 'Merzouga',
            'description': 'Venture deep into the Sahara with a Merzouga desert trip, riding camels over the dunes and sleeping under a sky full of stars.',
            'src': '/static/images/Merzouga1.jpg',
            'json_content': '{"link": "theme/merzouga", "link_text": "Read More"}',
            'order': 5
        },
        {
            'title': 'Hot Air Balloon',
            'description': 'Soar above the breathtaking landscapes of Marrakech at sunrise and witness a panoramic view like no other.',
            'src': '/static/images/AirBallon7.jpg',
            'json_content': '{"link": "theme/hotairballoon", "link_text": "Read More"}',
            'order': 6
        },
        {
            'title': 'Immobilier',
            'description': 'Explore the dynamic real estate market in Morocco, where you can find a diverse range of properties, from charming traditional homes to modern developments, offering excellent investment opportunities in a vibrant and growing market.',
            'src': '/static/images/immobilier9.jpg',
            'json_content': '{"link": "theme/immobilier", "link_text": "Read More"}',
            'order': 7
        },
        {
            'title': 'Paragliding Aguergour',
            'description': 'Experience the thrill of paragliding in Morocco and enjoy breathtaking bird\'s-eye views of the stunning landscapes, from the Atlas Mountains to the beautiful coastlines.',
            'src': '/static/images/parapont8.webp',
            'json_content': '{"link": "theme/paraglidingaguergour", "link_text": "Read More"}',
            'order': 8
        },
        {
            'title': 'Imlil',
            'description': 'Discover the captivating beauty of Imlil, Morocco\'s mountain gem, where adventure meets breathtaking landscapes.',
            'src': '/static/images/imlil1.jpg',
            'json_content': '{"link": "theme/imlil", "link_text": "Read More"}',
            'order': 9
        },
        {
            'title': 'Tangier',
            'description': 'Discover the vibrant culture of Tangier on a guided tour, where you can explore historic sites, bustling markets, and stunning coastal views, all while immersing yourself in the city\'s rich history and unique charm.',
            'src': '/static/images/tangier7.jpg',
            'json_content': '{"link": "theme/tangier", "link_text": "Read More"}',
            'order': 10
        }
    ]
    
    for item in about_items:
        Element.objects.create(
            section=about_section,
            title=item['title'],
            description=item['description'],
            src=item['src'],
            json_content=item['json_content'],
            order=item['order']
        )
    
    # Create Facts section
    facts_section = Section.objects.create(
        page=page,
        name='facts',
        type='json',
        order=2
    )
    
    # Create Facts element
    facts_json = {
        'items': [
            {
                'icon': 'fas fa-map-marker-alt',
                'title': '50+',
                'text': 'Destinations Covered'
            },
            {
                'icon': 'fas fa-globe',
                'title': '1,000+',
                'text': 'Happy Travelers'
            },
            {
                'icon': 'fas fa-car',
                'title': '300+',
                'text': 'Tours Organized'
            },
            {
                'icon': 'fas fa-star',
                'title': '100%',
                'text': 'Customer Satisfaction'
            }
        ]
    }
    
    Element.objects.create(
        section=facts_section,
        json_content=json.dumps(facts_json),
        order=0
    )

def create_gallery_page_sections(page):
    """Create sections for the Gallery page"""
    # Create Header section
    header_section = Section.objects.create(
        page=page,
        name='header',
        type='text',
        order=0
    )
    
    # Create Header elements
    Element.objects.create(
        section=header_section,
        title='Gallery',
        description='Discover the magic of Morocco, a land of breathtaking landscapes, rich culture, and unforgettable adventures. From the golden dunes of the Sahara to the vibrant souks of Marrakech, explore ancient medinas, majestic mountains, and stunning coastal towns. Experience the warmth of Moroccan hospitality, savor traditional cuisine, and embark on a journey full of history, adventure, and beauty.',
        order=0
    )
    
    # Create Gallery section
    gallery_section = Section.objects.create(
        page=page,
        name='gallery',
        type='image',
        order=1
    )
    
    # Create Gallery elements
    gallery_items = [
        {'src': '/static/images/gallery-1.jpg', 'order': 0},
        {'src': '/static/images/gallery-2.jpg', 'order': 1},
        {'src': '/static/images/gallery-3.jpg', 'order': 2},
        {'src': '/static/images/assaouira5.jpg', 'order': 3},
        {'src': '/static/images/assaouira6.jpg', 'order': 4},
        {'src': '/static/images/assaouira4.jpg', 'order': 5},
        {'src': '/static/images/parapont4.jpg', 'order': 6},
        {'src': '/static/images/parapont6.jpg', 'order': 7},
        {'src': '/static/images/parapont7.jpg', 'order': 8},
        {'src': '/static/images/Ourika5.jpg', 'order': 9},
        {'src': '/static/images/Ouzoud4.jpg', 'order': 10},
        {'src': '/static/images/Ourika6.jpg', 'order': 11}
    ]
    
    for item in gallery_items:
        Element.objects.create(
            section=gallery_section,
            src=item['src'],
            order=item['order']
        )

def create_contact_page_sections(page):
    """Create sections for the Contact page"""
    # Create Header section
    header_section = Section.objects.create(
        page=page,
        name='header',
        type='text',
        order=0
    )
    
    # Create Header elements
    Element.objects.create(
        section=header_section,
        title='Contact',
        description='Get in touch with us! We\'d love to hear from you. Whether you have questions, feedback, or need assistance, please reach out, and our team will be happy to help you.',
        order=0
    )
    
    # Create Contact section
    contact_section = Section.objects.create(
        page=page,
        name='contact',
        type='form',
        order=1
    )
    
    # Create Contact elements
    contact_json = {
        'form': {
            'fields': [
                {'name': 'name', 'type': 'text', 'label': 'Your name', 'required': True},
                {'name': 'email', 'type': 'email', 'label': 'Your email', 'required': True},
                {'name': 'message', 'type': 'textarea', 'label': 'Your message', 'required': True}
            ],
            'submit_text': 'Send message',
            'whatsapp_number': '212643562320'
        },
        'contact_info': [
            {
                'icon': 'fa fa-phone-alt',
                'title': 'Phone',
                'content': '+212643562320'
            },
            {
                'icon': 'fa fa-map-marked-alt',
                'title': 'Address',
                'content': 'Rue Mohammed V, 2ème étage, n°10, Immeuble royal Air Maroc guilez',
                'link': 'https://maps.app.goo.gl/fdoKHvVYEAToYJk98'
            },
            {
                'icon': 'fa fa-envelope',
                'title': 'Message',
                'content': 'moubela276@gmail.com'
            }
        ]
    }
    
    Element.objects.create(
        section=contact_section,
        json_content=json.dumps(contact_json),
        order=0
    )

def create_theme_page_sections(page):
    """Create sections for theme pages"""
    # Create Header section
    header_section = Section.objects.create(
        page=page,
        name='header',
        type='image',
        order=0
    )
    
    # Create Header elements
    Element.objects.create(
        section=header_section,
        title=page.name,
        description=f'Experience the beauty of {page.name}, one of Morocco\'s most enchanting destinations.',
        src=f'/static/images/{page.slug.lower()}1.jpg',
        order=0
    )
    
    # Create Description section
    description_section = Section.objects.create(
        page=page,
        name='description',
        type='text',
        order=1
    )
    
    # Create Description elements
    Element.objects.create(
        section=description_section,
        title=f'{page.name} Experience',
        description=f'Discover the enchanting beauty of {page.name}, a breathtaking destination in Morocco known for its stunning landscapes and vibrant culture.',
        order=0
    )
    
    # Create Gallery section
    gallery_section = Section.objects.create(
        page=page,
        name='gallery',
        type='image',
        order=2
    )
    
    # Create Gallery elements (3 images per theme)
    for i in range(1, 4):
        Element.objects.create(
            section=gallery_section,
            src=f'/static/images/{page.slug.lower()}{i}.jpg',
            order=i-1
        )
    
    # Create Booking section
    booking_section = Section.objects.create(
        page=page,
        name='booking',
        type='form',
        order=3
    )
    
    # Create Booking elements
    booking_json = {
        'form': {
            'fields': [
                {'name': 'name', 'type': 'text', 'label': 'Full Name', 'required': True},
                {'name': 'email', 'type': 'email', 'label': 'Email', 'required': True},
                {'name': 'phone', 'type': 'tel', 'label': 'Phone Number', 'required': True},
                {'name': 'date', 'type': 'date', 'label': 'Trip Date', 'required': True},
                {'name': 'guests', 'type': 'select', 'label': 'Number of Guests', 'options': ['1', '2', '3', '4', '5+'], 'required': True},
                {'name': 'message', 'type': 'textarea', 'label': 'Special Requests', 'required': False}
            ],
            'submit_text': 'Book Now',
            'whatsapp_number': '212643562320'
        },
        'price': '90€ per person'
    }
    
    Element.objects.create(
        section=booking_section,
        json_content=json.dumps(booking_json),
        order=0
    )

def main():
    """Main function to seed the database"""
    print("Starting database seeding...")
    
    # Create superuser
    create_superuser()
    
    # Clear database
    clear_database()
    
    # Create pages and content
    create_base_pages()
    create_theme_pages()
    
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    main()
