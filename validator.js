const $ = document.querySelector.bind(document);

function Validator(options) {

    var sectionRules = {};
// Hàm thực hiện validate
    function validate(inputElement, rule) {
        var errElement = inputElement.parentElement.querySelector(options.formMessage);
        var errMessage;

        var rules = sectionRules[rule.section];
        console.log(rules);
        for (let i = 0; i < rules.length; i++) {
            errMessage = rules[i](inputElement.value);
            if (errMessage) break;
        }

        if (errMessage) {
            errElement.innerText = errMessage;
            inputElement.parentElement.classList.add('invalid');
        } else {
            errElement.innerText = '';
            inputElement.parentElement.classList.remove('invalid')
        }
    }

    // get element of form need validate
    var elementForm = $(options.form);

    if (elementForm) {
        options.rules.forEach( rule => {
        var inputElement = elementForm.querySelector(rule.section);
        
        if (Array.isArray(sectionRules[rule.section])) {
            sectionRules[rule.section].push(rule.test);
        } else {
            sectionRules[rule.section] = [rule.test];
        }

        if (inputElement) {
            var errElement = inputElement.parentElement.querySelector(options.formMessage);
            // handle user blur 
            inputElement.onblur = () => {
                validate(inputElement, rule);
            }  
            // handle user input tiếp
            inputElement.oninput = () => {
                errElement.innerText = '';
                inputElement.parentElement.classList.remove('invalid')
            }
        }
        });
    }
}

Validator.isRequired = section =>(
    {
        section,
        test(value) {
            return value.trim() ? undefined : 'Vui lòng nhập trường này';
        }
    })


Validator.isEmail = section => (
    {
        section,
        test(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ 
            return regex.test(value) ? undefined : 'Vui lòng nhập đúng địa chỉ email'
        }
    })

Validator.minLength = (section, min, message = 'Please enter your value') => (
    {
        section,
        test(value) {
            return value.length >= min ? undefined : message;
        }
    })

Validator.confirmPassword = (section,getPassword, message = 'Please enter your value') => (
    {
        section,
        test(value) {
            return value === getPassword() ? undefined : message;
        }
    }
)