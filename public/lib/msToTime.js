export default function msToTime(duration, twelveHours) {
  let milliseconds = Math.floor((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    // days = Math.floor(duration / (1000 * 60 * 60 * 24))

  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds

  if(twelveHours) {
    let hoursGreaterThanTwelve = null
    if(hours > 12) {
      hoursGreaterThanTwelve = hours - 12
      return(
        hoursGreaterThanTwelve +
        ':' +
        minutes +
        ' PM'
      )
    } else if(hours == 12) {
      return(
        hours +
        ':' +
        minutes +
        ' PM' 
      )
    } else {
      return(
        hours +
        ':' +
        minutes +
        ' AM' 
      )
    }
  }

  return (
    // 'Days: ' +
    // days +
    // '........' +
    hours +
    ':' +
    minutes +
    ':' +
    seconds +
    '.' +
    milliseconds
  )
}