export default function msToTime(duration) {
  let milliseconds = Math.floor((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    // days = Math.floor(duration / (1000 * 60 * 60 * 24))

  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds

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