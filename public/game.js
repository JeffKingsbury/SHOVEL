//Popup messages in the bottom center of the screen. timeIn is how long the fadein effect takes, timeOut is how long the message remains on screen.
//A random key is generated (count) as the ID so it can be faded out easily. I'm sure there is a better way, but whatever it works.
function createToast(type, message = "test", timeIn, timeOut) {
    let color;
    let border;
    let count = Math.ceil(Math.random() * 10000);

    switch (type) {
        case "milestone":
            color = "bg-green-300";
            border = "border-green-600";
            break;
        case "caution":
            color = "bg-yellow-400";
            border = "border-yellow-600";
            break;
        case "warning":
            color = "bg-red-400 text-white";
            border = "border-red-600";
            break;
        default:
            color = "bg-gray-50";
            border = "border-gray-400";
            break;
    }

    $("#toastArea").append(`       
    <div id="toast${count}" 
    style="margin: 1rem; height: 4rem; min-width: 30%; padding-left: 2rem; padding-right: 2rem; padding: 1rem;" 
    class="flex flex-row justify-around items-center rounded-lg shadow-md border-2 border-b-4 font-mono font-semibold text-xl ${color} ${border}">
            <p> ${message} </p>
        </div>
  `);

    //Again, there is probably an easier way, but this will hide the message and fade it in once its appended.
    $(`#toast${count}`).hide().fadeIn(timeIn);

    //This will set a timeout based on the timeOut variable to fadeout and remove the notification.
    const toastHide = setTimeout(() => {
        $(`#toast${count}`).fadeOut(timeIn, () => {
            $(`#toast${count}`).remove();
        });
    }, timeOut);
}

//Manually clicking the dig button will generate a random weight between 1-12 kg (The average shovelfull of snow, yes I actually looked that up.)
//It will the create an icon with the weight displayed where the mouse was located, and fade out while moving upwards.
function clickDig(x, y) {
    let id = Math.ceil(Math.random() * 10000) * player.totalDug;
    let weight = Math.ceil(Math.random() * 12);
    player.totalDug += weight;
    player.drivewayProg += weight;
    player.walletAdd(weight);
    $("#gameArea").append(`       
    <div 
    id="toast${id}" 
    style="height: 4rem; position:absolute; left:${x - 26}px; top:${
    y - 26
  }px;pointer-events: none;">
  <i class="far fa-4x text-blue-300 fa-snowflake" style="text-shadow:1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000;"></i>
              <p 
            class="text-center mt-4 font-semibold text-lime-200 font-['p2'] text-sm " 
            style="text-shadow:1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000;">
            + ${weight} Kg
            </p>
        </div>`);

    $(`#toast${id}`).animate({
            top: y - 200,
            opacity: 0,
        },
        1200,
        () => {
            $(`#toast${id}`).remove();
        }
    );
}

//This is where all the auto-digging magic happens.
//Every second this function will run (forever).
//It checks if the player has anything that auto-digs, and if yes adds it to the total dug, and passes the weight to the walletAdd function to give the player money.
//It will also add a timestamp every second to localStorage, so if the player exits the page and reopens, it can calculate how much was shoveled while they were away.
const dig = setInterval(() => {
    if (player.kgps === 0) {
        $("#autoDigLoader").removeClass("load");
    }
    player.totalDug += player.kgps;
    player.walletAdd(player.kgps);
    localStorage.setItem("lastDigTS", Date.now());
}, 1000);

//Store button template.
//It games all the relevant info from player.shop[]
//It has its own purchase() function and remains self contained so multiple can be added without touching the props of the other items.
Vue.component("shopbutton", {
    props: ["title", "cost", "kgps", "qty"],
    data: function() {
        return {
            qty: 0,
            currentcost: this.cost,
            kgps: this.kgps,
        };
    },

    watch: {},
    computed: {},
    methods: {
        purchase: function() {
            if (player.wallet >= this.cost) {
                if (!$("#autoDigLoader").hasClass("load")) {
                    $("#autoDigLoader").addClass("load");
                }
                for (x in player.shop) {
                    if (player.shop[x].title == this.title) {
                        player.shop[x].cost = (player.shop[x].cost * 1.08).toFixed(2);
                        player.shop[x].qty++;
                        localStorage.setItem(`${x}Shop`, player.shop[x].qty);
                    }
                }
                player.wallet -= this.cost;
                player.kgps += this.kgps;
            } else {
                createToast("warning", "Insufficient funds", 300, 1000);
            }
        },
    },
    template: `      
    <div class="w-full bg-slate-300 flex h-16 px-2 items-center justify-around border-2 active:bg-gray-200 cursor-pointer select-none hover:bg-white font-mono text-sm" v-on:click="purchase()">     
        <div class="flex flex-col w-full">     
            <p>{{title}}</p>
            <p>{{cost | toCurrency}}</p>
            </div>
            <div class="flex flex-col w-full justify-center items-center text-center">     
            <p class="w-3/4">{{kgps}} Kg per second</p>
            </div>
            <div class="lg:flex hidden flex-col w-1/3 text-right">     
            <p>Owned:</p>
            <p>{{qty}}</p>
            </div>    
            
            </div>
    `,
});

//Taken from https://stackoverflow.com/questions/43208012/how-do-i-format-currencies-in-a-vue-component
//Super nice little filter to convert the wallet float to formatted currency (ex: $120,000,000.00 instead of $120000000.00)
Vue.filter("toCurrency", function(value) {
    if (typeof value !== "number") {
        return value;
    }
    var formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    });
    return formatter.format(value);
});

//Initializing the Vue instance, with all player info.
const player = new Vue({
    el: "#gameArea",
    data: function() {
        return {
            //default values:
            awayPenalty: 0.5,
            wallet: 0,
            totalDug: 0,
            kgps: 0,
            items: {
                children: 0,
            },
            shop: [{
                    title: "children",
                    cost: 15,
                    kgps: 2,
                    shown: false,
                    qty: 0,
                },
                {
                    title: "Electric Snowblower",
                    cost: 250,
                    kgps: 60,
                    shown: false,
                    qty: 0,
                },
                {
                    title: "Gas Snowblower",
                    cost: 1200,
                    kgps: 115,
                    shown: false,
                    qty: 0,
                },
                {
                    title: "City snow plow",
                    cost: 500000,
                    kgps: 10000000000,
                    shown: false,
                    qty: 0,
                },
            ],
        };
    },
    computed: {
        driveway: function() {
            return `Average driveways shoveled: ${Math.floor(this.totalDug / 650)}`;
        },
        convertDug: function() {
            if (this.totalDug < 1000) return `${this.totalDug} Kg`;
            if (this.totalDug == 1000)
                return `${(this.totalDug / 1000).toFixed(2)} ton`;
            if (this.totalDug > 1000 && this.totalDug < 1000000)
                return `${(this.totalDug / 1000).toFixed(2)} tons`;
            if (this.totalDug == 1000000)
                return `${(this.totalDug / 1000000).toFixed(2)} Kiloton`;
            if (this.totalDug > 1000000 && this.totalDug < 1000000000)
                return `${(this.totalDug / 1000000).toFixed(2)} Kilotons`;
            if (this.totalDug == 1000000000)
                return `${(this.totalDug / 1000000000).toFixed(2)} Megaton`;
            if (this.totalDug > 1000000000 && this.totalDug < 1000000000000)
                return `${(this.totalDug / 1000000000).toFixed(2)} Megatons`;
            if (this.totalDug == 1000000000000)
                return `${(this.totalDug / 1000000000000).toFixed(2)} Gigaton`;
            if (this.totalDug > 1000000000000 && this.totalDug < 1000000000000000)
                return `${(this.totalDug / 1000000000000).toFixed(2)} Gigatons`;
            if (this.totalDug == 1000000000000000)
                return `${(this.totalDug / 1000000000000000).toFixed(2)} Teraton`;
            if (
                this.totalDug > 1000000000000000 &&
                this.totalDug < 1000000000000000000
            )
                return `${(this.totalDug / 1000000000000000).toFixed(2)} Teraton`;
            if (this.totalDug == 1000000000000000000)
                return `${(this.totalDug / 1000000000000000000).toFixed(2)} Petaton`;
            if (
                this.totalDug > 1000000000000000000 &&
                this.totalDug < 1000000000000000000000
            )
                return `${(this.totalDug / 1000000000000000000).toFixed(2)} Petatons`;
            if (this.totalDug == 1000000000000000000000)
                return `${(this.totalDug / 1000000000000000000000).toFixed(2)} Exaton`;
            if (this.totalDug > 1000000000000000000000)
                return `${(this.totalDug / 1000000000000000000000).toFixed(2)} Exatons`;
        },
    },
    watch: {
        wallet: function() {
            localStorage.setItem("wallet", this.wallet.toFixed(2));

            //Shop unlocks
            if (this.wallet > 15 && this.shop[0].shown == false) {
                this.shop[0].shown = true;
                localStorage.setItem("0Shown", "true");

                $("#store").animate({
                        width: "50%",
                    },
                    1000
                );
                $("#autoDig").fadeIn(2000);
            }

            if (this.wallet > 150 && this.shop[1].shown == false) {
                this.shop[1].shown = true;
            }
            if (this.wallet > 1000 && this.shop[2].shown == false) {
                this.shop[2].shown = true;
            }
            if (this.wallet > 5000 && this.shop[3].shown == false) {
                this.shop[3].shown = true;
            }
        },

        kgps: function() {
            localStorage.setItem("kgps", this.kgps);
        },

        totalDug: function() {
            localStorage.setItem("totalDug", this.totalDug);
        },
    },
    methods: {
        walletAdd: function(kgs) {
            this.wallet += kgs * 0.16;
        },
    },
    mounted: function() {
        //The OnLoad function.

        //Setting different functions for grabbing the correct cookies
        //***Yes this is a bit redundant, but it works.
        function getCookieVersion(cname = "version") {
            let name = cname + "=";
            let decodedCookie = decodeURIComponent(document.cookie);
            let ca = decodedCookie.split(";");
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == " ") {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return " " + c.substring(name.length, c.length);
                }
            }
            return "";
        }

        function getCookieUnlocks(cname) {
            let name = cname + "=";
            let decodedCookie = decodeURIComponent(document.cookie);
            let ca = decodedCookie.split(";");
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == " ") {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    if (c.substring(name.length, c.length) == "true") {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
            return false;
        }

        function getCookiePlayer(cname) {
            let name = cname + "=";
            let decodedCookie = decodeURIComponent(document.cookie);
            let ca = decodedCookie.split(";");
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == " ") {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return 0;
        }

        function getCookieLocalCheck(cname = "localCheck") {
            let name = cname + "=";
            let decodedCookie = decodeURIComponent(document.cookie);
            let ca = decodedCookie.split(";");
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == " ") {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    if (c.substring(name.length, c.length) == "true") {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
            return true;
        }

        //This will keep the page title updated with the latest version number supplied by the server, instead of updating it manually.
        $("html").append(`<title>SHOVEL${getCookieVersion()}</title>`);

        //This checks if the user is logged in or playing locally.
        //If they're playing locally the game is handed over to localstorage, otherwise the server will send the initial info via cookies for all the player variables and progress.
        if (getCookieLocalCheck() == true) {
            localStorage.setItem("localCheck", "true");

            if (!localStorage.getItem("wallet")) {
                localStorage.setItem("wallet", 0);
            }
            if (!localStorage.getItem("kgps")) {
                localStorage.setItem("kgps", 0);
            }
            if (!localStorage.getItem("totalDug")) {
                localStorage.setItem("totalDug", 0);
            }
            this.wallet = parseFloat(localStorage.getItem("wallet"));
            this.kgps = parseFloat(localStorage.getItem("kgps"));
            this.totalDug = parseFloat(localStorage.getItem("totalDug"));

            for (x = 0; x < this.shop.length; x++) {
                localStorage.getItem(`${x}Shown`) ?
                    null :
                    localStorage.setItem(`${x}Shown`, "false");
                this.shop[x].shown =
                    localStorage.getItem(`${x}Shown`) == "true" ? true : false;
                this.shop[x].qty = parseInt(localStorage.getItem(`${x}Shop`)) || 0;
                if (this.shop[x].qty > 0) {
                    for (i = 0; i < this.shop[x].qty; i++) {
                        this.shop[x].cost = (this.shop[x].cost * 1.08).toFixed(2);
                    }
                }
            }
        } else {
            localStorage.setItem("localCheck", "false");
            this.awayPenalty = parseFloat(getCookiePlayer("awayPenalty")).toFixed(2);
            this.wallet = parseFloat(getCookiePlayer("wallet")).toFixed(2);
            this.kgps = parseInt(getCookiePlayer("kgps"));
            this.totalDug = parseInt(getCookiePlayer("totalDug"));

            for (x = 0; x < this.shop.length; x++) {
                this.shop[x].shown = getCookieUnlocks(`${x}Shown`);
            }
        }

        //Get the progress from when the game was closed to now.
        if (localStorage.getItem("lastDigTS")) {
            let timeAway = Date.now() - localStorage.getItem("lastDigTS");
            //12 hour cap on away progress
            timeAway > 43200000 ? (timeAway = 43200000) : null;
            let timeAwaySeconds = Math.floor(timeAway / 1000);
            let timeAwayKg = timeAwaySeconds * this.kgps;
            let timeAwayMoney = timeAwayKg * 0.16 * this.awayPenalty;
            this.wallet = parseFloat(this.wallet) + parseFloat(timeAwayMoney);

            console.log("You were away for", timeAwaySeconds, "seconds");
            console.log(
                "You dug",
                timeAwayKg,
                "Kg while you were away (12 hours maximum)"
            );
            console.log(
                "Thats worth",
                timeAwayMoney,
                "$! (There is a penalty of",
                this.awayPenalty,
                "deducted for digging while away)"
            );
        }

        if (this.kgps > 0) {
            if (!$("#autoDigLoader").hasClass("load")) {
                $("#autoDigLoader").addClass("load");
            }
        }

        this.shop[0].shown == false ?
            $("#autoDig").hide() :
            $("#store").animate({
                    width: "50%",
                },
                1000
            );
    },
});

//reset all progress locally. Currently only usable in the dev console for testing, will eventually be used as a button in settings
function resetLocal() {
    player.kgps = 0;
    player.wallet = 0;
    localStorage.clear();
    location.reload();
}