class DocumentsController < ApplicationController

	before_filter :require_login

	# serving the html webpage for a document.  
	def index 
		@document = Document.find_by( canonical_key:params[:canonical_key] )
		unless @document
			raise ActiveRecord::RecordNotFound
		end

    # respond_to do |format|
    #   format.html { redirect_to controllers_url }
    #   format.json { head :no_content }
    # end
	end

	def random #redirects
		if @document = Document.random_doc
			redirect_to document_url( @document.canonical_key )
		else
			render text: "Tell journalists to setup some docs first!"
		end

    # respond_to do |format|
    #   format.html { redirect_to controllers_url }
    #   format.json { head :no_content }
    # end
	end

	# class Api::DocumentsController < ApplicationController
	# sending/receiving json from the backbone application
	# Everything under api is JSON only and is intended to be an endpoint for the backbone models and collections
	# use Rail's content-type negotiation to do the right thing
    # respond_to do |format|
    #   format.html { redirect_to controllers_url }
    #   format.json { head :no_content }
    # end
	
end