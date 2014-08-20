class JournosController < ApplicationController

	before_filter :require_journalist_login
	
	def index
	end

end
