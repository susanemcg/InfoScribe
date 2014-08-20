class User < ActiveRecord::Base

	validate :third_party_identities_is_unique
	def third_party_identities_is_unique
		if self.third_party_identities.blank?
			return
		end
		#build a sql query to check for a duplicate entry by using the postgresql hstore query operators
		#querying hstore: http://www.youlikeprogramming.com/2011/11/working-with-the-hstore-data-type-in-postgresql-9-0/
		#
		 #The "@>" operator queries for an exact key and value match
		 #the `?` are sql statement bind placeholders, and will be replaced by the variable contents in the "values" line.
		condition = self.third_party_identities.map{|provider,id| "third_party_identities @> hstore(?,?)" }.join(' or ')
		condition << " and id<>#{self.id}" unless new_record?
		#
		values = self.third_party_identities.map{|k,v| [k.to_s,v.to_s] }.flatten
		#Rails will pass them to Postgresql where they're substituted for the "?"
		if account = User.where( [ condition, *values ] ).first
			duplicated = account.third_party_identities.to_set.intersection( self.third_party_identities ).map{|k,v| k}.join(',')
			#Rails considers a model savable if the "errors" are empty.
			#add to the errors which will inform Rails that it cannot save the model
			errors.add( :third_party_identities,"An account exists with the same id for #{account.id} #{account.third_party_identities.to_json} #{duplicated}" )
		end
	end

	def hash
		{ :id=>id,:name =>name,:email=>email,:dc_id=>dc_id }
	end

	def is_journalist?
		! self.dc_id.nil?
	end

	scope :with_third_party_identity, lambda{ |provider,id|
		where("third_party_identities @> hstore( :provider,:id )", :provider=>provider.to_s,:id=>id.to_s )
	}
	def self.find_or_create_from_authentication(auth)
		user = User.with_third_party_identity( auth['provider'],auth['uid'] ).first || User.new( { :third_party_identities=>{} } )
	end

end
