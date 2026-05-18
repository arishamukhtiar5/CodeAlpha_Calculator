
    // ---------- NOVACALC CORE - BETTER THAN EVER ----------
    let currentOperand = '0';
    let previousOperand = '';
    let operation = null;
    let shouldResetScreen = false;

    const previousOperandEl = document.getElementById('previousOperand');
    const currentOperandEl = document.getElementById('currentOperand');

    // advanced formatting with smart rounding & scientific notation
    function formatNumber(numberStr) {
        if (numberStr === '' || numberStr === undefined) return '0';
        if (numberStr === 'Error') return 'Error';
        let num = parseFloat(numberStr);
        if (isNaN(num)) return '0';
        if (!isFinite(num)) return 'Error';
        
        // huge or tiny -> scientific with nice precision
        if (Math.abs(num) > 1e13 || (Math.abs(num) < 1e-8 && num !== 0)) {
            return num.toExponential(8);
        }
        // integer check
        if (Number.isInteger(num)) {
            return num.toString();
        } else {
            let formatted = num.toFixed(10).replace(/\.?0+$/, '');
            if (formatted.length > 18) {
                formatted = num.toExponential(8);
            }
            return formatted;
        }
    }

    function updateDisplay() {
        // current display logic
        let displayCurr = currentOperand === 'Error' ? 'Error' : currentOperand;
        if (displayCurr === 'Error') {
            currentOperandEl.innerText = 'Error';
            currentOperandEl.style.background = 'none';
            currentOperandEl.style.color = '#ffb09c';
            currentOperandEl.style.webkitBackgroundClip = 'unset';
        } else {
            currentOperandEl.style.background = 'linear-gradient(125deg, #ffffff, #b3e4ff, #7bc5ff)';
            currentOperandEl.style.webkitBackgroundClip = 'text';
            currentOperandEl.style.backgroundClip = 'text';
            currentOperandEl.style.color = 'transparent';
            currentOperandEl.innerText = formatNumber(displayCurr);
        }

        // expression preview area
        if (operation !== null && previousOperand !== '') {
            let formattedPrev = formatNumber(previousOperand);
            let opSym = '';
            switch (operation) {
                case '+': opSym = '+'; break;
                case '-': opSym = '−'; break;
                case '*': opSym = '×'; break;
                case '/': opSym = '÷'; break;
                case '%': opSym = '%'; break;
                default: opSym = operation;
            }
            previousOperandEl.innerText = `${formattedPrev} ${opSym}`;
        } else {
            if (previousOperand !== '' && !shouldResetScreen && currentOperand !== 'Error') {
                previousOperandEl.innerText = formatNumber(previousOperand);
            } else {
                previousOperandEl.innerText = '';
            }
        }
        if (currentOperand === 'Error') previousOperandEl.innerText = '';
    }

    function clearAll() {
        currentOperand = '0';
        previousOperand = '';
        operation = null;
        shouldResetScreen = false;
        updateDisplay();
    }

    function deleteLast() {
        if (currentOperand === 'Error') {
            clearAll();
            return;
        }
        if (shouldResetScreen) {
            currentOperand = '0';
            shouldResetScreen = false;
            updateDisplay();
            return;
        }
        if (currentOperand.length === 1 || currentOperand === '0') {
            currentOperand = '0';
        } else {
            currentOperand = currentOperand.slice(0, -1);
            if (currentOperand === '' || currentOperand === '-') currentOperand = '0';
        }
        updateDisplay();
    }

    function appendNumber(number) {
        if (currentOperand === 'Error') {
            clearAll();
        }
        if (shouldResetScreen) {
            currentOperand = '';
            shouldResetScreen = false;
        }
        if (number === '.') {
            if (currentOperand.includes('.')) return;
            if (currentOperand === '' || currentOperand === '0') {
                currentOperand = '0.';
                updateDisplay();
                return;
            }
        }
        if (currentOperand === '0' && number !== '.' && !shouldResetScreen) {
            currentOperand = number;
        } else {
            currentOperand += number;
        }
        if (currentOperand.length > 20) currentOperand = currentOperand.slice(0, 20);
        updateDisplay();
    }

    function compute() {
        if (operation === null || previousOperand === '') return null;
        let prev = parseFloat(previousOperand);
        let curr = parseFloat(currentOperand);
        if (isNaN(prev) || isNaN(curr)) return 'Error';
        let result;
        switch (operation) {
            case '+': result = prev + curr; break;
            case '-': result = prev - curr; break;
            case '*': result = prev * curr; break;
            case '/': 
                if (curr === 0) return 'Error';
                result = prev / curr;
                break;
            case '%': 
                if (curr === 0) return 'Error';
                result = prev % curr;
                break;
            default: return null;
        }
        if (!isFinite(result)) return 'Error';
        result = parseFloat(result.toFixed(10));
        return result.toString();
    }

    function chooseOperator(op) {
        if (currentOperand === 'Error') {
            clearAll();
        }
        if (operation !== null && previousOperand !== '' && !shouldResetScreen) {
            const computed = compute();
            if (computed === 'Error') {
                currentOperand = 'Error';
                previousOperand = '';
                operation = null;
                shouldResetScreen = true;
                updateDisplay();
                triggerErrorEffect();
                return;
            }
            if (computed !== null) {
                previousOperand = computed;
                currentOperand = computed;
                updateDisplay();
            }
        }
        operation = op;
        if (currentOperand !== '' && currentOperand !== 'Error') {
            previousOperand = currentOperand;
        } else if (previousOperand === '' && currentOperand !== 'Error') {
            previousOperand = '0';
        }
        shouldResetScreen = true;
        updateDisplay();
    }

    function evaluateEquals() {
        if (currentOperand === 'Error') {
            clearAll();
            return;
        }
        if (operation === null || previousOperand === '' || shouldResetScreen) {
            if (currentOperand === 'Error') clearAll();
            return;
        }
        const result = compute();
        if (result === 'Error') {
            currentOperand = 'Error';
            previousOperand = '';
            operation = null;
            shouldResetScreen = true;
            updateDisplay();
            triggerErrorEffect();
            return;
        }
        if (result !== null) {
            currentOperand = result;
            previousOperand = '';
            operation = null;
            shouldResetScreen = true;
            updateDisplay();
        } else {
            clearAll();
        }
    }

    function triggerErrorEffect() {
        const displayDiv = document.querySelector('.display-section');
        displayDiv.classList.add('error-pulse');
        setTimeout(() => {
            displayDiv.classList.remove('error-pulse');
        }, 400);
    }

    // ---- EVENT HANDLING - Premium feel ----
    function handleButtonClick(e) {
        const btn = e.currentTarget;
        // ripple effect already via CSS, but we add little pop
        if (btn.hasAttribute('data-number')) {
            const num = btn.getAttribute('data-number');
            appendNumber(num);
        }
        else if (btn.hasAttribute('data-op')) {
            let op = btn.getAttribute('data-op');
            if (op === '÷') op = '/';
            if (op === '×') op = '*';
            if (op === '−') op = '-';
            chooseOperator(op);
        }
        else if (btn.hasAttribute('data-equals')) {
            evaluateEquals();
        }
        else if (btn.classList.contains('clear')) {
            clearAll();
        }
        else if (btn.classList.contains('delete')) {
            deleteLast();
        }
        // extra haptic feedback (scale)
        btn.style.transform = 'scale(0.97)';
        setTimeout(() => { if(btn) btn.style.transform = ''; }, 100);
    }

    // attach all buttons
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', handleButtonClick);
    });

    // ---------- FULL KEYBOARD INTEGRATION (Premium) ----------
    function handleKeyboard(e) {
        const key = e.key;
        const allowed = ['0','1','2','3','4','5','6','7','8','9','.','+','-','*','/','%','Enter','=','Backspace','Escape','Delete'];
        if (allowed.includes(key) || (key >= '0' && key <= '9')) {
            e.preventDefault();
        }
        // numbers
        if (/[0-9]/.test(key)) appendNumber(key);
        else if (key === '.') appendNumber('.');
        else if (key === '+') chooseOperator('+');
        else if (key === '-') chooseOperator('-');
        else if (key === '*') chooseOperator('*');
        else if (key === '/') chooseOperator('/');
        else if (key === '%') chooseOperator('%');
        else if (key === 'Enter' || key === '=') evaluateEquals();
        else if (key === 'Backspace') deleteLast();
        else if (key === 'Escape' || key === 'Delete') clearAll();

        // visual feedback for keyboard mapped button
        let mappedBtn = null;
        if (key >= '0' && key <= '9') mappedBtn = document.querySelector(`button[data-number="${key}"]`);
        else if (key === '.') mappedBtn = document.querySelector(`button[data-number="."]`);
        else if (key === '+') mappedBtn = document.querySelector(`button[data-op="+"]`);
        else if (key === '-') mappedBtn = document.querySelector(`button[data-op="-"]`);
        else if (key === '*') mappedBtn = document.querySelector(`button[data-op="*"]`);
        else if (key === '/') mappedBtn = document.querySelector(`button[data-op="/"]`);
        else if (key === '%') mappedBtn = document.querySelector(`button[data-op="%"]`);
        else if (key === 'Enter') mappedBtn = document.querySelector('.equals');
        else if (key === 'Backspace') mappedBtn = document.querySelector('.delete');
        else if (key === 'Escape') mappedBtn = document.querySelector('.clear');
        if (mappedBtn) {
            mappedBtn.style.transform = 'scale(0.96)';
            setTimeout(() => { if(mappedBtn) mappedBtn.style.transform = ''; }, 100);
        }
    }
    window.addEventListener('keydown', handleKeyboard);
    
    // Override core functions for error resilience
    const origAppend = appendNumber;
    const enhancedAppend = (num) => { if (currentOperand === 'Error') clearAll(); origAppend(num); };
    window.appendNumber = enhancedAppend;
    appendNumber = enhancedAppend;

    const origChoose = chooseOperator;
    const enhancedChoose = (op) => { if (currentOperand === 'Error') clearAll(); origChoose(op); };
    chooseOperator = enhancedChoose;

    const origEqual = evaluateEquals;
    const enhancedEqual = () => { if (currentOperand === 'Error') clearAll(); else origEqual(); };
    evaluateEquals = enhancedEqual;

    const origDelete = deleteLast;
    const enhancedDelete = () => { if (currentOperand === 'Error') clearAll(); else origDelete(); };
    deleteLast = enhancedDelete;

    // init display
    updateDisplay();
