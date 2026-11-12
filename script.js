<<<<<<< HEAD
const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const previousCalculationDisplay = document.getElementById("previousCalculation");
const keypad = document.querySelector(".keypad");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const message = document.getElementById("message");

const historyBtn = document.getElementById("historyBtn");
const historyPanel = document.getElementById("historyPanel");
const panelOverlay = document.getElementById("panelOverlay");
const closeHistoryBtn = document.getElementById("closeHistory");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");

const menuBtn = document.getElementById("menuBtn");
const menuPopup = document.getElementById("menuPopup");
const menuClearHistory = document.getElementById("menuClearHistory");
const menuAbout = document.getElementById("menuAbout");

let expression = "";
let justCalculated = false;
let calculationHistory = [];

// Update the expression display
function updateDisplay() {
    expressionDisplay.textContent = expression || "";
}

// Format numbers for display
function formatResult(number) {
    if (!Number.isFinite(number)) {
        return "Error";
    }

    return Number(number.toPrecision(10)).toLocaleString("en-US", {
        maximumFractionDigits: 8
    });
}

// Calculate the expression
function calculate() {
    if (!expression.trim()) return;

    try {
        let safeExpression = expression
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .replace(/−/g, "-");

        // Allow only calculator characters
        if (!/^[0-9+\-*/().%\s]+$/.test(safeExpression)) {
            throw new Error("Invalid expression");
        }

        // Convert percentages into decimal calculations
        safeExpression = safeExpression.replace(
            /(\d+(?:\.\d+)?)%/g,
            "($1/100)"
        );

        const result = Function(
            '"use strict"; return (' + safeExpression + ')'
        )();

        if (typeof result !== "number" || !Number.isFinite(result)) {
            throw new Error("Invalid calculation");
        }

        previousCalculationDisplay.textContent = `${expression} = ${formatResult(result)}`;
        const formattedResult = formatResult(result);

        // Save calculation in history
        calculationHistory.unshift({
            expression: expression,
            result: formattedResult
        });

        resultDisplay.textContent = formattedResult;
        message.textContent = "";
        justCalculated = true;

        renderHistory();

    } catch (error) {
        resultDisplay.textContent = "Error";
        message.textContent = "";
    }
}

// Add a number, decimal, or operator
function addValue(value) {
    if (justCalculated) {
        if (/^[0-9.]$/.test(value)) {
            expression = "";
            resultDisplay.textContent = "0";
        }

        justCalculated = false;
    }

    if ("+−×÷".includes(value)) {
        if (!expression && value !== "−") return;

        // Replace the last operator if another is entered
        if (/[+−×÷]$/.test(expression)) {
            expression = expression.slice(0, -1);
        }

        expression += value;

    } else {
        // Prevent multiple decimal points in the same number
        if (value === ".") {
            const currentNumber = expression.split(/[+−×÷()]/).pop();

            if (currentNumber.includes(".")) return;
        }

        expression += value;
    }

    updateDisplay();
    message.textContent = "";
}

// Clear the calculator
function clearCalculator() {
    expression = "";
    resultDisplay.textContent = "0";
    message.textContent = "";
    justCalculated = false;
    previousCalculationDisplay.textContent = "";

    updateDisplay();
}

// Delete the last character
function backspace() {
    if (justCalculated) {
        clearCalculator();
        return;
    }

    expression = expression.slice(0, -1);

    updateDisplay();
    message.textContent = "";
}

// Change the sign of the current number
function changeSign() {
    if (!expression) {
        expression = "−";
        updateDisplay();
        return;
    }

    if (justCalculated) {
        const resultText = resultDisplay.textContent.replace(/,/g, "");
        const resultNumber = Number(resultText);

        if (Number.isFinite(resultNumber)) {
            expression = String(-resultNumber).replace("-", "−");
            resultDisplay.textContent = "0";
        }

        justCalculated = false;
        updateDisplay();
        return;
    }

    // Find the last number in the expression
    const match = expression.match(/(\d+\.?\d*|\.\d+)$/);

    if (!match) return;

    const number = match[0];
    const start = match.index;
    const beforeNumber = expression.slice(0, start);

    // If the number is already negative, remove its minus sign
    if (beforeNumber.endsWith("−")) {
        const beforeMinus = beforeNumber.slice(0, -1);

        // Keep the minus if it represents subtraction
        if (
            beforeMinus === "" ||
            /[+−×÷(]$/.test(beforeMinus)
        ) {
            expression = beforeMinus + number;
        } else {
            expression = beforeNumber + number;
        }
    } else {
        expression = beforeNumber + "−" + number;
    }

    updateDisplay();
}

// Add a percentage sign
function percentage() {
    if (!expression) return;

    if (justCalculated) {
        justCalculated = false;
    }

    const match = expression.match(/(\d+(?:\.\d+)?)$/);

    if (match && !expression.endsWith("%")) {
        expression =
            expression.slice(0, -match[0].length) +
            match[0] +
            "%";

        updateDisplay();
    }
}

// Handle keypad clicks
keypad.addEventListener("click", function (event) {
    const button = event.target.closest("button");

    if (!button) return;

    const value = button.dataset.value;
    const action = button.dataset.action;

    if (action === "clear") {
        clearCalculator();

    } else if (action === "backspace") {
        backspace();

    } else if (action === "calculate") {
        calculate();

    } else if (action === "sign") {
        changeSign();

    } else if (action === "percent") {
        percentage();

    } else if (value !== undefined) {
        addValue(value);
    }
});

// Toggle light and dark themes
themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    themeIcon.textContent = isDark ? "☾" : "☀";

    themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
    );

    themeToggle.title = isDark ? "Light theme" : "Dark theme";
});

// Render calculation history in the side panel
function renderHistory() {
    if (!historyList) return;

    if (calculationHistory.length === 0) {
        historyList.innerHTML =
            '<p class="empty-history">Your calculations will appear here.</p>';
        return;
    }

    historyList.innerHTML = "";

    calculationHistory.forEach(function (item) {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";

        const historyExpression = document.createElement("div");
        historyExpression.className = "history-expression";
        historyExpression.textContent = item.expression;

        const historyResult = document.createElement("div");
        historyResult.className = "history-result";
        historyResult.textContent = "= " + item.result;

        historyItem.append(historyExpression, historyResult);

        // Click a previous calculation to reuse its result
        historyItem.style.cursor = "pointer";

        historyItem.addEventListener("click", function () {
            expression = item.result.replace(/,/g, "").replace(/-/g, "−");
            resultDisplay.textContent = item.result;
            justCalculated = true;

            updateDisplay();
            closeHistory();
        });

        historyList.appendChild(historyItem);
    });
}

// Open the history side panel
function openHistory() {
    renderHistory();

    historyPanel.classList.add("open");
    panelOverlay.classList.add("open");

    historyPanel.setAttribute("aria-hidden", "false");
    menuPopup.hidden = true;
}

// Close the history side panel
function closeHistory() {
    historyPanel.classList.remove("open");
    panelOverlay.classList.remove("open");

    historyPanel.setAttribute("aria-hidden", "true");
}

historyBtn.addEventListener("click", openHistory);

closeHistoryBtn.addEventListener("click", closeHistory);

panelOverlay.addEventListener("click", closeHistory);

// Clear history from inside the history panel
clearHistoryBtn.addEventListener("click", function () {
    calculationHistory = [];
    renderHistory();
});

// Open or close the three-dot menu
menuBtn.addEventListener("click", function (event) {
    event.stopPropagation();

    menuPopup.hidden = !menuPopup.hidden;
});

// Clear history from the three-dot menu
menuClearHistory.addEventListener("click", function () {
    calculationHistory = [];
    renderHistory();

    menuPopup.hidden = true;
});

// About option opens a small popup instead of a bottom message
menuAbout.addEventListener("click", function () {
    menuPopup.hidden = true;

    const existingAbout = document.getElementById("aboutPopup");

    if (existingAbout) {
        existingAbout.remove();
        return;
    }

    const aboutPopup = document.createElement("div");
    aboutPopup.id = "aboutPopup";
    aboutPopup.className = "menu-popup";

    aboutPopup.style.top = "110px";

    aboutPopup.innerHTML = `
        <strong style="display:block; padding:10px;">
            Simple Calculator
        </strong>
        <p style="padding:0 10px; font-size:13px; line-height:1.5;">
            A simple calculator with calculation history and light and dark themes.
        </p>
        <button id="closeAbout">Close</button>
    `;

    document.body.appendChild(aboutPopup);

    document.getElementById("closeAbout").addEventListener("click", function () {
        aboutPopup.remove();
    });
});

// Close menus and panels when clicking outside
document.addEventListener("click", function (event) {
    if (
        !menuPopup.hidden &&
        !menuPopup.contains(event.target) &&
        !menuBtn.contains(event.target)
    ) {
        menuPopup.hidden = true;
    }

    const aboutPopup = document.getElementById("aboutPopup");

    if (
        aboutPopup &&
        !aboutPopup.contains(event.target) &&
        !menuBtn.contains(event.target) &&
        !menuAbout.contains(event.target)
    ) {
        aboutPopup.remove();
    }
});

// Keyboard support
document.addEventListener("keydown", function (event) {
    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        addValue(key);

    } else if (key === "+") {
        addValue("+");

    } else if (key === "-") {
        addValue("−");

    } else if (key === "*") {
        addValue("×");

    } else if (key === "/") {
        event.preventDefault();
        addValue("÷");

    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();

    } else if (key === "Backspace") {
        backspace();

    } else if (key === "Escape") {
        clearHistoryPanelAndMenu();
        clearCalculator();

    } else if (key === "(" || key === ")") {
        addValue(key);

    } else if (key === "%") {
        percentage();
    }
});

// Close panels and menus with Escape
function clearHistoryPanelAndMenu() {
    closeHistory();
    menuPopup.hidden = true;

    const aboutPopup = document.getElementById("aboutPopup");

    if (aboutPopup) {
        aboutPopup.remove();
    }
}

// Set the initial history display
renderHistory();
=======

>>>>>>> a028ebd9546b89360e0f8fb4f984b536d38edb65
