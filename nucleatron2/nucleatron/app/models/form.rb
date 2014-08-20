class Form < ActiveRecord::Base

	has_many :documents

	validates :slug, :uniqueness=>true
	validates :name,:src_id,:src_thumbnail,:src_title,:slug, :presence=>true

	# for app/controllers/api/forms_controller.rb
	def canonical
		self.as_json.merge({ documents:self.documents.map{|d| d.hash} })
	end

end
