class EditModeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if user is authenticated and has edit mode enabled
        if request.user.is_authenticated and request.session.get('edit_mode', False):
            request.edit_mode = True
        else:
            request.edit_mode = False
        
        response = self.get_response(request)
        return response
