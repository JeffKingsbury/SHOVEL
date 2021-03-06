//Popup messages in the bottom center of the screen. timeIn is how long the fadein effect takes, timeOut is how long the message remains on screen.
//A random key is generated (count) as the ID so it can be faded out easily. I'm sure there is a better way, but whatever it works.
function createToast(type, message = "test", timeIn, timeOut) {
    let color;
    let border;

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

    $(`<div style="margin: 1rem; height: 4rem; min-width: 30%; padding-left: 2rem; padding-right: 2rem; padding: 1rem;" 
    class="flex flex-row justify-around items-center rounded-lg shadow-md border-2 border-b-4 font-mono font-semibold text-xl ${color} ${border}">
    <p> ${message} </p>
    </div>`)
        .delay(timeOut)
        .appendTo("#toastArea")
        .fadeOut(1000, function() {
            $(this).remove();
        });
}

//Manually clicking the dig button will generate a random weight between 1-12 kg (The average shovelfull of snow, yes I actually looked that up.)
//It will the create an icon with the weight displayed where the mouse was located, and fade out while moving upwards, then will remove itself.
function clickDig(x, y) {
    let weight = Math.ceil(Math.random() * 12);
    let walletx = document.getElementById("walletUi").getBoundingClientRect().x;
    let wallety = document.getElementById("walletUi").getBoundingClientRect().y;
    (player.shovelBonus > 0) ? weight *= player.shovelBonus: null;
    player.totalDug += weight;
    player.drivewayProg += weight;
    player.walletAdd(weight);
    $(`<div 
    style="height: 4rem; position:absolute; left:${x - 26}px; top:${
    y - 26
  }px;pointer-events: none; ">
  <i class="far fa-4x text-blue-300 fa-snowflake" style="text-shadow:1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000;"></i>
              <p 
            class="text-center mt-4 font-semibold text-lime-200 font-['p2'] text-sm " 
            style="text-shadow:1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000;">
            + ${weight} Kg
            </p>
        </div>`)
        .appendTo("#gameArea")
        .animate({
                top: wallety,
                left: walletx,
                opacity: 0,
            },
            2000,
            function() {
                $(this).remove();
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
    props: ["title", "cost", "kgps", "qty", "description", "img"],
    data: function() {
        return {
            qty: 0,
            currentcost: this.cost,
            kgps: this.kgps,
            hover: false
        };
    },

    watch: {
        hover: function() {
            if (hover == true) {
                console.log(hover)
            } else {
                console.log(hover)
            }
        }
    },
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
    
    <div style="contain:content;width:93%" class="m-auto rounded-lg bg-slate-400 my-1 flex h-16 px-2 items-center justify-around border-t-2 border-4 border-b-8 border-slate-500 active:bg-slate-400 active:border-slate-500 hover:scale-105 active:scale-95 transition ease-in-out cursor-pointer select-none hover:bg-slate-300 hover:border-slate-400 font-mono text-sm" v-on:click="purchase()">     
  
            <img :src="img" alt="item icon" class="absolute -left-2 top-0 h-20" style="width:auto" />
            
            
            <div class="flex flex-col w-full justify-center items-center text-center">     
            <p class="text-lg">{{title}}</p>
            <p class="text-xs">{{kgps}} Kg per second</p>
            </div>
            <div class="flex w-1/2 flex-col text-right">     
            <p class="">$ {{cost | toCurrency}}</p>
            <p class="inline text-xs">Owned: {{qty}}</p>
            </div>    
            </div>
    `,
});
Vue.component("shovelupgradebutton", {
    props: ["title", "cost", "bonus", "img"],
    data: function() {

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
    <button class="w-16 h-16 rounded-lg bg-slate-700 shadow-gray-700 shadow-md flex justify-center items-center m-2 hover:scale-105 active:scale-95 transition ease-in-out" style="contain:content" v-on:click="purchase()">
    <img draggable="false" :src="img" alt="upgrade icon" style="height:70%"/>
    </button>   `,
});


Vue.component("autoupgradebutton", {
    props: ["title", "cost", "bonus", "img"],
    data: function() {

    },

    watch: {},
    computed: {},
    methods: {
        purchase: function() {
            if (player.wallet >= this.cost) {
                for (x in player.autoUpgrades) {
                    if (player.autoUpgrades[x].title == this.title) {
                        //player.autoUpgrades[x].used = true;
                        player.autoUpgrades[x].bonus()
                    }
                }

                //player.wallet -= this.cost;

            } else {
                createToast("warning", "Insufficient funds", 300, 1000);
            }
        },
    },
    template: `      
<button class="w-16 h-16 rounded-lg bg-slate-700 shadow-gray-700 shadow-md flex justify-center items-center m-2 hover:scale-105 active:scale-95 transition ease-in-out" style="contain:content" v-on:click="purchase()">
<img draggable="false" :src="img" alt="upgrade icon" style="height:70%"/>
</button>
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
            settingsTooltip: false,
            uid: null,
            //default values:
            awayPenalty: 0.5,
            shovelBonus: 1,
            autoBonus: 1,
            wallet: 0,
            totalDug: 0,
            kgps: 0,

            modals: {
                welcome: false,
                welcome2: false,
                tutorial1: false,
            },
            shop: [{
                    title: "Local kid",
                    description: "A local child whos parents agreed will help out! Can't shovel all that much (for now). But cheap labor is cheap labor.",
                    cost: 15,
                    kgps: 2,
                    shown: false,
                    qty: 0,
                    bonusMultiplier: 0,
                    img: "./style/img/baby.png"
                },
                {
                    title: "Snoomba",
                    description: "Someone had the bright idea of converting their smart vacuum into a smart shovel. Somehow it actually worked.",
                    cost: 250,
                    kgps: 15,
                    shown: false,
                    qty: 0,
                    bonusMultiplier: 0,
                    img: "./style/img/snoomba.png"

                },
                {
                    title: "Skilled worker",
                    description: "One ad on Fourth-wall Marketplace (Formerly Visage Tome) later and you have yourself a \"skilled\" worker.",
                    cost: 1200,
                    kgps: 85,
                    shown: false,
                    qty: 0,
                    bonusMultiplier: 0,
                    img: "./style/img/worker.png"


                },
                {
                    title: "City snow plow",
                    description: "",
                    cost: 500000,
                    kgps: 50000,
                    shown: false,
                    qty: 0,
                    bonusMultiplier: 0,
                    img: "./style/img/plow.png"


                },
            ],
            autoUpgrades: [{
                title: "Special Milk",
                description: "Help those kids grow big and strong! Children can now shovel twice as much.",
                cost: 0,
                bonus: function() {
                    for (x in player.shop) {
                        if (player.shop[x].title == "children") {
                            let owned = player.shop[x].qty;
                            let currentKgps = player.shop[x].kgps;
                            let update = owned * currentKgps;
                            player.kgps += update;
                            player.shop[x].kgps *= 2;
                        }
                    }
                },
                unlocked: true,
                used: false,
                img: "./style/img/upgrades/specialMilk.png"
            }],


            shovelUpgrades: [{
                title: "Bigger shovel",
                description: "Shovel 2x more per click using this bigger shovel.",
                cost: 500,
                bonus: 2,
                unlocked: false,
                used: false,
                img: "./style/img/upgrades/shovel1.png"
            }, ]
        };
    },
    computed: {
        moneyPerSecond: function() {
            return this.kgps * 0.16
        },
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
            if (this.modals.welcome2 == false) {
                this.modals.welcome2 = true
            }
            localStorage.setItem("wallet", this.wallet.toFixed(2));

            //Shop unlocks
            if (this.wallet > 15 && this.shop[0].shown == false) {
                this.shop[0].shown = true;
                localStorage.setItem("0Shown", "true");

                $("#store").animate({
                        width: "50%",
                    },
                    800
                );
                player.modals.tutorial1 = true;
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
        modals: {
            handler: function(val) {
                for (x in val) {
                    localStorage.setItem(`modal${x}`, val[x])
                }
            },
            deep: true
        },
    },
    methods: {
        walletAdd: function(kgs) {
            this.wallet += kgs * 0.16;
        },
        autoUpgradeFunc: function() {
            console.log("hey")
        }
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
            return false;
        }

        //This will keep the page title updated with the latest version number supplied by the server, instead of updating it manually.
        $("html").append(`<title>SHOVEL${getCookieVersion()}</title>`);


        if (getCookiePlayer("uid") == 0 && getCookieLocalCheck() == false && localStorage.getItem('localCheck') == 'false' || getCookiePlayer("uid") == null && getCookieLocalCheck() == false && localStorage.getItem('localCheck') == 'false') {
            window.location.replace("/");
        }


        this.uid = getCookiePlayer("uid")

        if (this.uid != 0) {

            let getData = new XMLHttpRequest;
            getData.open("POST", "/getUserData");
            getData.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            getData.send(JSON.stringify({ uid: this.uid }))
            getData.onreadystatechange = function() {
                if (getData.readyState === XMLHttpRequest.DONE) {
                    let status = getData.status;
                    if (status === 0 || (status >= 200 && status < 400)) {
                        localStorage.setItem("playerJsonServ", JSON.stringify(JSON.parse(getData.responseText).playerData))
                    }
                }
            }
        }
        //This checks if the user is logged in or playing locally.
        //If they're playing locally the game is handed over to localstorage, otherwise the server will send the initial info via cookies for all the player variables and progress.
        if (getCookieLocalCheck() == true || localStorage.getItem('playerJsonServ') == 'null' || localStorage.getItem('localCheck') == 'true') {
            if (localStorage.getItem("newAccCheck") == 'true') {
                if (!confirm("There is offline progress not associated to this account. Would you like to transfer the offine progress to this account?")) {
                    localStorage.clear();
                    localStorage.setItem("newAccCheck", false)
                    localStorage.setItem("playerJsonServ", null)
                    location.reload()
                    return
                }
            }
            if (!localStorage.getItem("wallet")) {
                localStorage.setItem("wallet", 0);
            }
            if (!localStorage.getItem("kgps")) {
                localStorage.setItem("kgps", 0);
            }
            if (!localStorage.getItem("totalDug")) {
                localStorage.setItem("totalDug", 0);
            }
            for (x in this.modals) {
                if (!localStorage.getItem(`modal${x}`)) {
                    localStorage.setItem(`modal${x}`, false);
                }
                this.modals[x] = (localStorage.getItem(`modal${x}`) === "false") ? false : true;
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
            let servData = JSON.parse(localStorage.getItem('playerJsonServ'));
            this.awayPenalty = servData.awayPenalty;
            this.wallet = servData.wallet;
            this.kgps = servData.kgps;
            this.totalDug = servData.totalDug;
            this.shovelBonus = servData.shovelBonus;
            this.autoBonus = servData.autoBonus;


            for (x = 0; x < this.shop.length; x++) {
                this.shop[x] = servData.shop[x];
            }
            for (x = 0; x < this.autoUpgrades.length; x++) {
                this.autoUpgrades[x].unlocked = servData.autoUpgrades[x].unlocked;
            }
            for (x = 0; x < this.shovelUpgrades.length; x++) {
                this.shovelUpgrades[x].unlocked = servData.shovelUpgrades[x].unlocked;
            }
            for (x in this.modals) {
                this.modals[x] = servData.modals[x];
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


const updateUser = function() {
    if (localStorage.getItem('localCheck') == 'false') {
        let updateServ = new XMLHttpRequest;
        updateServ.open("POST", "/updateUser");
        updateServ.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        updateServ.send(JSON.stringify(player.$data))
    }
}
const update = setInterval(function() {
    if (localStorage.getItem('localCheck') == 'false' || !localStorage.getItem('localCheck')) {
        let updateServ = new XMLHttpRequest;
        updateServ.open("POST", "/updateUser");
        updateServ.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        updateServ.send(JSON.stringify(player.$data))
    }
}, 1000)