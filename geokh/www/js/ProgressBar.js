function ProgressBar() {
    this.distanceAtDepart = 0;
    this.advancePercentage = 0;
    this.elementHTML = document.getElementById("progress-bar");
    this.elementFillingHTML = document.getElementsByClassName("progress-filling")[0];
    this.isInitialized = false;
}

ProgressBar.prototype.initialize = function(distanceAtDepart) {
    this.isInitialized = true;
    this.distanceAtDepart = Number(distanceAtDepart);
    this.elementHTML.style["display"] = "block";
};

ProgressBar.prototype.draw = function(newDistance) {
    this.advancePercentage = (100 - (100 * newDistance) / (this.distanceAtDepart)) + "%"
    this.elementFillingHTML.style["width"] = this.advancePercentage;
};
