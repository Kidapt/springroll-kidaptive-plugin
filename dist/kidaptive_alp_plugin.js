/**
 * Created by solomonliu on 11/29/16.
 */
(function() {
    "use strict";
    var plugin = new springroll.ApplicationPlugin();

    plugin.preload = function(done) {
        KidaptiveSdk.init(this.options.alp.appSecret, this.options.alp.version, this.options.alp.apiJsonUrl).then(function(sdk) {
            this.alp = sdk;
            //if Learning Module exists, turn learningEvents into behavior events
            if (this.learning) {
                this.learning.on("learningEvent", function(data) {
                    if (!this.alp.getCurrentUser()) {
                        return;
                    }
                    var eventName = this.learning.catalog.events[data.event_data.event_code];
                    var additionalFields = JSON.parse(JSON.stringify(data.event_data));
                    var args = {additionalFields: additionalFields};
                    if (this.config && this.config.gameIdMap && this.config.gameIdMap[data.game_id]) {
                        args.gameUri = this.config.gameIdMap[data.game_id];
                    }
                    if (additionalFields.duration) {
                        args.duration = additionalFields.duration / 1000; //learningEvents report duration in milliseconds
                        delete additionalFields["duration"];
                    }
                    additionalFields.game_id = data.game_id;
                    additionalFields.event_id = data.event_id;
                    this.alp.reportBehavior(eventName,args);
                }.bind(this));
            }
            done();
        }.bind(this));
    };
}());