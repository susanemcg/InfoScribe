class Response < ActiveRecord::Base

	belongs_to :user
	belongs_to :document

	validate :user,:document, :presence=>true

	scope :ordered_by_page, ->{ order('page') }
	scope :for_user, lambda{ |user| where( { :user_id=>user.id } ) }
	
end
