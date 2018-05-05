
#InfoScribe frontend to-dos

**new_project_page.html**

- date validation on transcription & embargo fields
- Implement file upload (reference post: http://uncorkedstudios.com/blog/multipartformdata-file-upload-with-angularjs)
- define/describe data input needed to populate page correctly (e.g. userID, orgID, real names, thumbnail images)
- define/describe json object that will represent "new project" data elements that will be sent back to server (e.g. title, description, keyword, file list &c). create sample object for reference
- add "Submit" button or similar that can pull necessary data from form and build sample object
- make "submit" redirect(?) to schema page. 

**contributor_dashboard.html**

- link "new project" button to "new project" page
- using existing "collections_highlight" snippet as a template, modify/refactor as necessary to display user's current/completed projects

**schema_page.html**
(do development on Chrome for now)

- Add upload element on schema page for "model document" and have *that* load into image area
- define/describe necessary inputs to page, create sample object for testing/development
- define/describe JSON object that should be sent from page to server, build from form contents
- make submit button redirect to project_page (needs to be built, variation on new_project_page template) for sample_project
