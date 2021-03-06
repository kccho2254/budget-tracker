(() => {
    let e,
        t = [];
    function n() {
        let e = t.reduce(((e, t) => e + parseInt(t.value)), 0);
        document.querySelector("#total").textContent = e
    }
    function a() {
        let e = document.querySelector("#tbody");
        e.innerHTML = "",
        t.forEach((t => {
            let n = document.createElement("tr");
            n.innerHTML = `\n      <td>${
                t.name
            }</td>\n      <td>${
                t.value
            }</td>\n    `,
            e.appendChild(n)
        }))
    }
    function o() {
        let n = t.slice().reverse(),
            a = 0,
            o = n.map((e => {
                let t = new Date(e.date);
                return `${
                    t.getMonth() + 1
                }/${
                    t.getDate()
                }/${
                    t.getFullYear()
                }`
            })),
            l = n.map((e => (a += parseInt(e.value), a)));
        e && e.destroy();
        let r = document.getElementById("myChart").getContext("2d");
        e = new Chart(r, {
            type: "line",
            data: {
                labels: o,
                datasets: [
                    {
                        label: "Total Over Time",
                        fill: !0,
                        backgroundColor: "#6666ff",
                        data: l
                    }
                ]
            }
        })
    }
    function l(e) {
        let l = document.querySelector("#t-name"),
            r = document.querySelector("#t-amount"),
            u = document.querySelector(".form .error");
        if ("" === l.value || "" === r.value) 
            return void(u.textContent = "Missing Information");
        
        u.textContent = "";
        let c = {
            name: l.value,
            value: r.value,
            date: (new Date).toISOString()
        };
        e || (c.value *= -1),
        t.unshift(c),
        o(),
        a(),
        n(),
        fetch("/api/transaction", {
            method: "POST",
            body: JSON.stringify(c),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            }
        }).then((e => e.json())).then((e => {
            e.errors ? u.textContent = "Missing Information" : (l.value = "", r.value = "")
        })).catch((e => {
            saveRecord(c),
            l.value = "",
            r.value = ""
        }))
    }
    fetch("/api/transaction").then((e => e.json())).then((e => {
        t = e,
        n(),
        a(),
        o()
    })),
    document.querySelector("#add-btn").onclick = function () {
        l(!0)
    },
    document.querySelector("#sub-btn").onclick = function () {
        l(!1)
    }
})();
