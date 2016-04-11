# outstream
Outstream initer for VPAID unit

## Installation
```bash
{sudo} npm install --global gulp-cli
{sudo} npm install --global bower
{sudo} npm install --global bower-installer
npm i
npm run build // build dist
npm run server // open index.html
```

## Usage
```javascript
  new Outstream({
      aid: 13694,
      width: 400,
      height: 300,
      containerEl: document.getElementById('ad-container')
  })
```