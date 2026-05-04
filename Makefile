
build: install package

install:
	npm install
	npm run compile

package:
	vsce package

clean:
	rm -rf out node_modules
	rm -f *.vsix
