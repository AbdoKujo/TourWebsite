from django.contrib import admin
from .models import Page, Section, Element, EditHistory

class ElementInline(admin.TabularInline):
    model = Element
    extra = 1

class SectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'page', 'type', 'order')
    list_filter = ('page', 'type')
    search_fields = ('name', 'page__name')
    inlines = [ElementInline]

class SectionInline(admin.TabularInline):
    model = Section
    extra = 1

class PageAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'slug')
    list_filter = ('type',)
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [SectionInline]

class ElementAdmin(admin.ModelAdmin):
    list_display = ('id', 'section', 'title', 'order')
    list_filter = ('section__page', 'section')
    search_fields = ('title', 'description', 'section__name')

class EditHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'element', 'field_name', 'timestamp')
    list_filter = ('user', 'field_name', 'timestamp')
    search_fields = ('user__username', 'element__title', 'field_name')
    readonly_fields = ('user', 'element', 'field_name', 'previous_value', 'new_value', 'timestamp')

admin.site.register(Page, PageAdmin)
admin.site.register(Section, SectionAdmin)
admin.site.register(Element, ElementAdmin)
admin.site.register(EditHistory, EditHistoryAdmin)
