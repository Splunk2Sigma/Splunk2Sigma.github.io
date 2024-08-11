new TomSelect("#select-backend", {
    controlInput: null,
    valueField: "value",
    labelField: "label",
    sortField: {
        field: "value",
        direction: "asc"
    }
});

new TomSelect("#select-format", {
    controlInput: null,
    valueField: "value",
    labelField: "label"
});

document.getElementById('convert-btn').addEventListener('click', async function () {
    const convertButton = document.getElementById('convert-btn');
    const validationStatus = document.getElementById('validation-status');
    const queryCodeArea = document.getElementById('query-code');

    convertButton.disabled = true; 
    convertButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...'; 
    validationStatus.style.display = 'none'; 

    const splunkInput = document.getElementById('rule-code').value;

    if (!splunkInput.trim()) {
        alert('Please enter a valid Splunk search.');
        convertButton.disabled = false; 
        convertButton.innerHTML = 'Convert'; 
        queryCodeArea.value = ""; 
        return;
    }

    const backend = document.getElementById('select-backend').value;
    const format = document.getElementById('select-format').value;

    try {
        queryCodeArea.value = "Generating Sigma rule. Please wait...";
        autoResize(queryCodeArea);

        const convertResponse = await fetch('https://splunk2sigma-65a4a257f8cf.herokuapp.com/convert', {  
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ splunkInput, backend, format })
        });

        const convertResult = await convertResponse.json();
        queryCodeArea.value = convertResult.sigmaRule; 
        autoResize(queryCodeArea);

        if (convertResult.status === "Pass") {
            validationStatus.textContent = "SigmaQ Validator: Pass";
            validationStatus.style.color = "green";
            validationStatus.classList.remove('fail');
            validationStatus.classList.add('pass');
        } else {
            validationStatus.innerHTML = `SigmaQ Validator: NA Validation <span style="font-size: 0.8em; font-style: italic;">${convertResult.validationErrors}</span>`;
            validationStatus.style.color = "black";
            validationStatus.style.backgroundColor = "green";
            validationStatus.classList.remove('pass', 'fail');
            validationStatus.classList.add('info');
        }
        validationStatus.style.display = 'block';

    } catch (error) {
        alert('An error occurred while converting the rule.');
        validationStatus.textContent = "SigmaQ Validator: Fail";
        validationStatus.style.color = "black";
        validationStatus.classList.remove('pass');
        validationStatus.classList.add('fail');
    } finally {
        convertButton.disabled = false; 
        convertButton.innerHTML = 'Convert'; 
    }
});
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function removePlaceholderStyle(textarea) {
    textarea.classList.remove('placeholder-style');
}
