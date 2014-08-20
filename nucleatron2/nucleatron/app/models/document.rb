require 'form_export/as_csv'

class Document < ActiveRecord::Base

	has_many :responses, :class_name=>'Response',:extend=>[FormExport::AsCSV]
	has_many :users_who_transcribed, ->{ uniq }, :class_name=>'User',:source=>:user,:through=>:responses

	validate :canonical_key,:title,:thumbnail_url, :presence=>true


	def self.random_doc
		#returns a document
		find_by_sql( "select * from #{table_name} where is_complete='f' offset floor( random() * ( SELECT count(*) from documents where is_complete='f' ) ) limit 1" ).first
	end

	def pages_with_forms
		template_files = Dir.glob( File.join( Rails.root,%w{ app assets tmpl forms },self.form_directory,'p*' ) )
		template_files.map{ | tmpl | tmpl=~/p(\d+).jst/; $1.to_i }.sort
	end
	def hash
		self.as_json.merge({ :users_who_transcribed=>self.users_who_transcribed.uniq.map{|u| u.hash },:pages_with_forms=>self.pages_with_forms })
	end

end