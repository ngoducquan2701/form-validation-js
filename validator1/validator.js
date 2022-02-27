const $ = document.querySelector.bind(document);

function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};
// Hàm thực hiện validate
    function validate(inputElement, rule) {
        var errElement = getParent(inputElement, options.formGroupSelector).querySelector(options.formMessage);
        var errMessage;

        var rules = selectorRules[rule.selector];
        for (let i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errMessage = rules[i](elementForm.querySelector(rule.selector + ':checked'));
                break;
                default:
                    errMessage = rules[i](inputElement.value);
            }
            if (errMessage) break;
        }

        if (errMessage) {
            errElement.innerText = errMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }
        // trả về true nếu input đúng, false nếu ng dung nhập sai
        return !errMessage;
    }

    // get element of form need validate
    var elementForm = $(options.form);

    if (elementForm) {
        //validate when submit
        elementForm.onsubmit = (e) => {
            e.preventDefault();

            var isFormValid = true;
            //loop each rules and validate
            options.rules.forEach(rule => {
                var inputElement = elementForm.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }  
            });
           
            if (isFormValid) {
                if (typeof options.onSubmit === 'function') {
                    var enabledInputs = elementForm.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enabledInputs).reduce((values, input) => {
                        switch (input.type) {
                            case 'radio':
                                if (input.matches(':checked')) {
                                values[input.name].push(input.value);
                                } else if (!values[input.name]) {
                                values[input.name] = '';
                                }
                                break;
                                
                            case 'checkbox':
                                if (input.matches(':checked')) {
                                if (!Array.isArray(values[input.name])) {
                                values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                } else if (!values[input.name]) {
                                values[input.name] = '';
                                }
                                break;
                            default: values[input.name] = input.value
                        }
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                } else {
                    elementForm.onSubmit();
                }
            }
        }

        
       

        //loop each rules and handle validation (listen to even blur, input)  
        options.rules.forEach( rule => {
        var inputElement = elementForm.querySelector(rule.selector);
        if (Array.isArray(selectorRules[rule.selector])) {
            selectorRules[rule.selector].push(rule.test);
        } else {
            selectorRules[rule.selector] = [rule.test];
        }

        if (inputElement) {
            var errElement = getParent(inputElement, options.formGroupSelector).querySelector(options.formMessage);
            // handle user blur 
            inputElement.onblur = () => {
                validate(inputElement, rule);
            }  
            // handle user input tiếp
            inputElement.oninput = () => {
                errElement.innerText = '';
                getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
            }
        }
        });
    }
}

Validator.isRequired = selector =>(
    {
        selector,
        test(value) {
            return value ? undefined : 'Vui lòng nhập trường này';
        }
    })


Validator.isEmail = selector => (
    {
        selector,
        test(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ 
            return regex.test(value) ? undefined : 'Vui lòng nhập đúng địa chỉ email'
        }
    })

Validator.minLength = (selector, min, message = 'Please enter your value') => (
    {
        selector,
        test(value) {
            return value.length >= min ? undefined : message;
        }
    })

Validator.confirmPassword = (selector,getPassword, message = 'Please enter your value') => (
    {
        selector,
        test(value) {
            return value === getPassword() ? undefined : message;
        }
    }
)