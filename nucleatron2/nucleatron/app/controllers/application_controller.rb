class ApplicationController < ActionController::Base
	# Prevent CSRF attacks by raising an exception.
	# For APIs, you may want to use :null_session instead.
	protect_from_forgery with: :exception

	helper_method :logged_in?,:current_user
	def logged_in?
		return ! session[:user_id].nil?
	end
	def current_user
		if logged_in?
			@current_user ||= User.find( session[:user_id] )
		end
	end


	def require_login
		unless logged_in?
			flash[:warning] = "You must be logged in to access this section" 
			redirect_to root_url
		end
	end

	def require_journalist_login
		unless logged_in? && current_user.is_journalist?
			flash[:warning] = "You must be logged in as an DocumentCloud Journalist to access this section" 
			redirect_to root_url
		end
	end

end
