## Love Eclipse Che but hate to run in browser?  Try Che Desktop !




### First run Eclipse Che
docker run -it --rm -v /var/run/docker.sock:/var/run/docker.sock -v /Users/jjonagam/che:/data eclipse/che start


### Create electron desktop app that embedds Che
```sh
git clone https://github.com/debianmaster/eclipse-che-desktop
npm install && npm start
```
