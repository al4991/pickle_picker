A project from uni that I found mildly interesting, and wanted to clean up.

I want to add some basic styling (from what I recall, it was only basic html :( ), and I want to refactor the code to use the context API and hooks (as well as just organizing the code better). 

Using React + Firebase's Firestore, and planning to deploy on netlify.

The idea was that if a user found a picture of food they didn't have a name for, this app would help identify it, and also help find places that have that food. 
The base functionality is that it would allow users to upload an image, which would then be parsed to generate tags by GCP's ML API. 
Afterwards, it would let users pick the tag that best fit, and run that into Yelp's API to find restaurants for that food nearby. 

