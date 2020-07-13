var numberHelper = (function () {

  function commaSeparateNumber (val) {
    while (/(\d+)(\d{3})/.test(val.toString())) {
      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
    return val;
  }

  return {
    commaSeparateNumber:      commaSeparateNumber
  }
})()

export default numberHelper
