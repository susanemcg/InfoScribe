class AuthenticationsController < ApplicationController

	def callback
		#current_user
		if logged_in? #already logged_in and trying to add another third_party_identity?
			current_user = User.find( session[:user_id] )
		else
			current_user = User.find_or_create_from_authentication( auth_hash )
		end
		#update_attributes
		current_user.third_party_identities_will_change! #necessary for the psql hstore to update
		newhash = current_user.third_party_identities || {}
		newhash[ auth_hash['provider'] ] = auth_hash['uid']
		current_user.update_attributes( third_party_identities:newhash )
		%w{ email name }.each{ |attr|
			if auth_hash['info'][attr]
				current_user.update_attributes( attr=>auth_hash['info'][attr] )
			end
		}
		#session[:user_id],flash[]
		if current_user.errors.empty?
			session[:user_id] = current_user.id
			flash[:info] = "Welcome, #{current_user.name}"
		else
			flash[:warning] = current_user.errors.full_messages.to_sentence
		end
		#redirect_to
		redirect_to request.env['omniauth.origin'] || '/'
	end

	def callback_dc
		#creating an instance of the DC::Remote class, which is located in lib/dc/remote.rb
		#creates it with the `params` from the controller.  They include the login/password from the form
		dc = DC::Remote.new(params)
		#tests it for validity by calling the `valid_login?` method
		if dc.valid_login?
			#records the information in the session, so it can be retrieved and used on later requests
			session[:dc] = dc.hash( :include_password=>false )
			#current_user
			current_user = User.find_by( dc_id:session[:dc][:dc_id] )
			if current_user.nil?
				current_user = User.create( dc_id:session[:dc][:dc_id],name:session[:dc][:name],email:session[:dc][:email] )
			else
				#update_attributes
				current_user.update_attributes( dc_id:session[:dc][:dc_id],name:session[:dc][:name],email:session[:dc][:email] )
			end
			#session[:user_id]
			session[:user_id] = current_user.id
			#flash[]
			if current_user.errors.empty?
				flash[:info] = "Welcome, #{current_user.name}"
			else
				flash[:warning] = current_user.errors.full_messages.to_sentence
			end
			#redirect_to
			redirect_to '/'
		else 
			flash[:warning] = "INVALID LOGIN!"
			#redirect_to
			redirect_to params[:origin] || '/'
		end
	end


	def failure
		flash[:warning] = params[:message]
		redirect_to params[:origin] || '/'
	end

	def logout
		current_user_name = current_user.name || "dear user"
		current_user = nil
		reset_session
		flash[:info] = "So long & thanks for all the fish, #{current_user_name}"
		redirect_to params[:origin] || '/'
	end


	private
	def auth_hash
		request.env['omniauth.auth']
	end
end
