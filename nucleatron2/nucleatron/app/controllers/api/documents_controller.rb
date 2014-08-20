class Api::DocumentsController < ApplicationController

  before_filter :require_login

  def index
    render :json => Document.includes([:users_who_transcribed]).map{|d| d.canonical }
  end

end
