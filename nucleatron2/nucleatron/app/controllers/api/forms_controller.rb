class Api::FormsController < ApplicationController

	before_filter :require_login

	def index
		render :json => Form.includes(:documents).all.map{ |f| f.canonical }
		# render :json => Form.all.map{ |f| f.canonical }
	end

	def create
	end

end
