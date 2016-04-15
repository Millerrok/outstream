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

## Events:

<md-table-container>
  <table md-table>
    <thead md-head >
      <tr md-row>
        <th md-column> Event Name </th>
        <th md-column> Description </th>
      </tr>
    </thead>
    <tbody md-body>
      <tr md-row >
        <td md-cell> 'loaded' </td>
        <td md-cell> On ad is loaded </td>
      </tr>
      <tr md-row >
        <td md-cell> 'error'</td>
        <td md-cell> On ad has some error</td>
      </tr>
       <tr md-row >
        <td md-cell> 'complete' </td>
        <td md-cell> On finish play ad </td>
      </tr>
      <tr md-row >
        <td md-cell> 'started' </td>
        <td md-cell> On ad start play </td>
      </tr>
       <tr md-row >
        <td md-cell> 'resumed' </td>
        <td md-cell> on resumes the current ad </td>
      </tr>
       <tr md-row >
        <td md-cell> 'paused' </td>
        <td md-cell> On ad is paused </td>
      </tr>
      <tr md-row >
        <td md-cell> 'mute' </td>
        <td md-cell> On ad volume muted </td>
      </tr>
      <tr md-row >
        <td md-cell> 'unmute' </td>
        <td md-cell> On ad volume unmuted </td>
      </tr>
    </tbody>
  </table>
</md-table-container>

```javascript
    var outstream = new Outstream({
        aid: 13694,
        width: 400,
        height: 300,
        containerEl: document.getElementById('ad-container')
    })

    outstream.on('load',function(){
        // code ...
    });
```
## Methods:

### on()
 Subscribe for Outstream event

### off()
 Unsubscribe from Outstream event

### trigger()
 Trigger Outstream event

### destroy()
 destroy Outstream containerEl content
