function Validator (selector) {
    function getParent (element, selector) {
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    var validationRules = {
        required (value) {
          return value ? undefined : 'Vui lòng nhập trường này';
        },
        email (value) {
            var regex =  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
            return regex.test(value) ? undefined : 'Vui lòng nhập đúng địa chỉ email'
        },
        min (min) {
            return value => (value.length >= min) ? undefined : ` Mật khẩu tối thiểu ${min} ký tự`;
        }
    }
    var formRules = {}

    var elementForm = document.querySelector(selector);
    if(elementForm) {
        var ruleInfo;
        var inputs = elementForm.querySelectorAll('[name][rules]');
        for (var input of inputs) {
            var rules = input.getAttribute('rules').split('|');
            for (var rule of rules) {
                var ruleHasTwoDots = rule.includes(':')
               if(ruleHasTwoDots) {
                    ruleInfo = rule.split(':')
                    rule = ruleInfo[0];
               }
               var ruleFunc = validationRules[rule];
               if (ruleHasTwoDots) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
               }

               if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunc);
               } else {
                    formRules[input.name] = [ruleFunc];
               }
            }
            input.onblur = handleValidate;
            input.oninput = handleClear;
            
        }
        // handle validate
        function handleValidate(event) {
            var rules = formRules[event.target.name];
            var errMessage;
            rules.find( rule => {
                errMessage = rule(event.target.value)
                return errMessage;
            })
            if(errMessage) {
                var formGroup = getParent(event.target, '.form-group');
                if (formGroup) {
                    formGroup.classList.add('invalid');
                   var formMessage =  formGroup.querySelector('.form-message')
                   if(formMessage) {
                     formMessage.innerText = errMessage;
                   }
                }
            }
            return !errMessage;
        }
        // handle clear err messager
        function handleClear(event) {
            var formGroup = getParent(event.target, '.form-group');
            if(formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');
            }
            var formMessage =  formGroup.querySelector('.form-message')
            if(formMessage) {
                formMessage.innerText = '';
            }
        }
    }
    // handle behavior submitform
    elementForm.onsubmit = function (event) {
        event.preventDefault();
        
        var inputs = elementForm.querySelectorAll('[name][rules]');
        var isValid = true

        for (var input of inputs) {
            if(!handleValidate({target: input})) {
                isValid = false;
            }
        }

        if (isValid) {
            elementForm.submit();
        }
    }
   
}