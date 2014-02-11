SHELL := /bin/bash

stones-throw.herokuapp.com:
	wget -r -l inf 'https://stones-throw.herokuapp.com'	

rest:
	rsync -avz ~/Sites/stones/public/img/ stones-throw.herokuapp.com/img
	cp ~/Sites/stones/public/farms.geojson stones-throw.herokuapp.com/

pages = contact csa faq farm farmers find-us get-involved signup why-csa

html: stones-throw.herokuapp.com
	for page in $(pages); do \
		sed -i "" 's/bq/blockquote/g' stones-throw.herokuapp.com/$$page; \
		tidy -i -utf8 stones-throw.herokuapp.com/$$page > stones-throw.herokuapp.com/$$page.html; \
		rm stones-throw.herokuapp.com/$$page; \
		ls; \
	done
	sed -i "" 's/bq/blockquote/g' stones-throw.herokuapp.com/index.html; \
	tidy -i -utf8 stones-throw.herokuapp.com/index.html > stones-throw.herokuapp.com/index.html.tidy; \
	mv stones-throw.herokuapp.com/index.html{.tidy,}

fix_links_and_text:
	for page in $(pages); do \
		sed -i "" "s|/$$page\"|/$$page.html\"|g" stones-throw.herokuapp.com/*.html; \
		ftfy stones-throw.herokuapp.com/$$page.html > stones-throw.herokuapp.com/$$page.html.fixed; \
		mv stones-throw.herokuapp.com/$$page.html{.fixed,}; \
	done
