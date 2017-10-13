function ThermometerGPS() {
    this.distanceAtDepart = 0;
    this.advancePercentage = 0;
    this.elementHTML = document.getElementById("thermometerGPS");
    this.elementFillingHTML = document.getElementsByClassName("thermometer-filling")[0];
    this.isInitialized = false;
}

ThermometerGPS.prototype.initialize = function(distanceAtDepart) {
    this.isInitialized = true;
    this.distanceAtDepart = Number(distanceAtDepart);
    this.elementHTML.style["display"] = "block";
};

ThermometerGPS.prototype.draw = function(newDistance) {
    this.advancePercentage = (100 - (100 * newDistance) / (this.distanceAtDepart)) + "%"
    this.elementFillingHTML.style["height"] = this.advancePercentage;
};
