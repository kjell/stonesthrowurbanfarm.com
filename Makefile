SHELL := /bin/bash

wget:
	wget -r -l inf 'https://stones-throw.herokuapp.com'	
	cp -R stones-throw.herokuapp.com/* .
	rm -rf stones-throw.herokuapp.com

rest:
	rsync -avz ~/Sites/stones/public/img/ img
	cp ~/Sites/stones/public/farms.geojson .

pages = contact csa faq farm farmers find-us get-involved signup why-csa

html:
	for page in $(pages); do \
		sed -i "" 's/bq/blockquote/g' $$page; \
		tidy -i -utf8 $$page > $$page.html; \
		rm $$page; \
		ls; \
	done
	sed -i "" 's/bq/blockquote/g' index.html; \
	tidy -i -utf8 index.html > index.html.tidy; \
	mv index.html{.tidy,}

fix_links_and_text:
	for page in $(pages); do \
		sed -i "" "s|/$$page\"|/$$page.html\"|g" *.html; \
		ftfy $$page.html > $$page.html.fixed; \
		mv $$page.html{.fixed,}; \
	done
	ftfy index.html > index.html.fixed
	mv index.html{.fixed,}
	sed -i '' 's/©/\&copy;/g' *.html
