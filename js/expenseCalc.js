$(function() {
	const $select = $('select.quantity');
	let totalPrice;
	let totalExpense = 0;
	let budget;
	let initialBudget;
	let yearIncome;
	let tax;
	let federalTax;
	let provincialTax;
	const allTaxRates = {
		ab: {
				taxBracket: [0, 131220, 157464, 209952, 314928, Infinity],
				taxRate: [0.10, 0.12, 0.13, 0.14, 0.15],
				tax: 0.05
		},
		bc: {
				taxBracket: [0, 40707, 81416, 93476, 113506, 153900, Infinity],
				taxRate: [0.0506, 0.077, 0.105, 0.1229, 0.147, 0.168],
				tax: 0.12
		},
		mb: {
				taxBracket: [0, 32670, 70610, Infinity],
				taxRate: [0.108, 0.1275, 0.174],
				tax: 0.13
		},
		nb: {
				taxBracket: [0, 42592, 85184, 138491, 157778, Infinity],
				taxRate: [0.0968, 0.1482, 0.1652, 0.1784, 0.2030],
				tax: 0.15
		},
		nl: {
				taxBracket: [0, 37591, 75181, 134224, 187913, Infinity],
				taxRate: [0.087, 0.145, 0.158, 0.173, 0.183],
				tax: 0.15
		},
		nt:	{
				taxBracket: [0, 43137, 86277, 140267, Infinity],
				taxRate: [0.059, 0.086, 0.122, 0.1405],
				tax: 0.05
		},
		ns: {
				taxBracket: [0, 29590, 59180, 93000, 150000, Infinity],
				taxRate: [0.0879, 0.1495, 0.1667, 0.1750, 0.21],
				tax: 0.15
		},
		nu: {
				taxBracket: [0, 45414, 90829, 147667, Infinity],
				taxRate: [0.04, 0.07, 0.09, 0.115],
				tax: 0.05
		},
		on: {
				taxBracket: [0, 43906, 62187, 70000, 220000, Infinity],
				taxRate: [0.04, 0.07, 0.09, 0.115],
				tax: 0.13
		},
		pe: {
				taxBracket: [0, 31984, 63969, Infinity],
				taxRate: [0.098, 0.138, 0.167],
				tax: 0.15
		},
		qc:	{
				taxBracket: [0, 43790, 87575, 106555, Infinity],
				taxRate: [0.15, 0.20, 0.24, 0.2575],
				tax: 0.14975
		},
		sk: {
				taxBracket: [0, 45225, 129214, Infinity],
				taxRate: [0.1050, 0.125, 0.145],
				tax: 0.11
		},
		yt: {
				taxBracket: [0, 47630, 95259, 147667, 500000, Infinity],
				taxRate: [0.064, 0.09, 0.109, 0.128, 0.15],
				tax: 0.05
		}
	};
	let  federalTaxRate = {
		taxBracket: [0, 47630, 95259, 147667, 210371, Infinity],
		taxRate: [0.15, 0.205, 0.26, 0.29, 0.33]
	};


	$('#perweek').attr("disabled", true);
    for (i=2;i<=100;i++){
        $select.append(`<option>${i}</option>`);
    }
	$('form.income').on('submit', function(event)	{
		event.preventDefault();
		const incomeInitial = $('form #income').val();
		const province = $("select.province").val();
		let provincialTaxRate = getProvincialTaxRate(province);
		tax = provincialTaxRate.tax;
		// provincialTaxRate = getProvincialTaxRate(province);
		yearIncome = getYearIncome(incomeInitial);
		if ($('#deductTax').is(':checked'))	{
			provincialTax = calcTax(yearIncome, provincialTaxRate);
			federalTax = calcTax(yearIncome, federalTaxRate);
			budget = Math.round((yearIncome - federalTax - provincialTax)/12);
		}
		else	{
			budget = Math.round(yearIncome/12);
		}
		initialBudget = budget;
		$('.budget').text(`Initial budget for the month: ${budget}`);
		$('p.total').text(`Budget left: $${budget}`);
		$('.budgetCalc').fadeIn('slow');
		$('form #income').val('');
		$('.input input').attr("disabled", true);
		$('.input select').attr("disabled", true);
	});

	$('form.expenses').on('submit', function(event)	{
		event.preventDefault();
		const item = $('form.expenses #name').val();
		const price = parseFloat($('form.expenses #price').val());
		const quantity = parseInt($('select.quantity option:selected').text());
		const taxFree = $('form.expenses #taxfree').is(':checked');
		if (taxFree)	{
			totalPrice = (quantity*price).toFixed(2);
		}
		else	{
			totalPrice = (quantity*price+quantity*price*tax).toFixed(2);
		}
		if(budget>=parseFloat(totalPrice))	{
			budget = (budget - totalPrice).toFixed(2);
			totalExpense = (parseFloat(totalExpense) + parseFloat(totalPrice)).toFixed(2);
			$('table').append(`<tr><td>${item}</td><td>${quantity}</td><td>${totalPrice}</td></tr>`);;
			$('.totalBudget').text(`Total expenses for this month: $${totalExpense}`);
			$('p.total').text(`Budget left: $${budget}`);
			$('form.expenses #name').val('');
			$('form.expenses #price').val('');
			$('select.quantity').val('1');
			$('#taxfree').prop('checked', false);
		}
		else	{
			$('#dialog').html(`You are trying to spend $${totalPrice}.<br></br>You only have $${budget} left.`);
			$('p.total').text(`Budget left: $${budget}`);
			$("#dialog").dialog();
		}
	});

	$('#reset').on('click', function(event)	{
		budget = initialBudget;
		totalExpense = 0;
		$('p.total').text(`Budget left: $${budget}`);
		$('.items').find("tr:gt(0)").remove();
		$('.totalBudget').text(`Total expenses for this month: $${totalExpense}`);

	});

	$('input[type="radio"]').on('click',function()	{
		let period = $('input[name="period"]:checked').val();
		if (period === 'hour') {
			$("#perweek").removeAttr("disabled");
		}
		else	{
			$("#perweek").attr("disabled", true);
		}
	});

	function getYearIncome(incomeInitial)	{
		let incomeYearly;
		const selection = $('input[name="period"]:checked').val();
		if (selection ==='month')	{
			incomeYearly = incomeInitial*12;
		}
		else if (selection ==='hour')	{
			let hoursPerWeek = $('#perweek').val();
			incomeYearly = incomeInitial*52.143*hoursPerWeek;
		}
		else	{
			incomeYearly = incomeInitial;
		}
		return incomeYearly;
	}

	function getProvincialTaxRate(province)	{
		let provincialTaxRate;
		// provincialTaxRate = allTaxRates[province];
		if (province === "ab")	{
			provincialTaxRate = allTaxRates.ab;
		}
		else if (province === "bc")	{
			provincialTaxRate = allTaxRates.bc;
		}
		else if (province === "mb")	{
			provincialTaxRate = allTaxRates.mb;
		}
		else if (province === "nb")	{
			provincialTaxRate = allTaxRates.nb;
		}
		else if (province === "nl")	{
			provincialTaxRate = allTaxRates.nl;
		}
		else if (province === "nt")	{
			provincialTaxRate = allTaxRates.nt;
		}
		else if (province === "ns")	{
			provincialTaxRate = allTaxRates.ns;
		}
		else if (province === "nu") {
			provincialTaxRate = allTaxRates.nu;
		}
		else if (province === "on") {
			provincialTaxRate = allTaxRates.on;
		}
		else if (province === "pe") {
			provincialTaxRate = allTaxRates.pe;
		}
		else if (province === "qc") {
			provincialTaxRate = allTaxRates.qc;
		}
		else if (province === "sk") {
			provincialTaxRate = allTaxRates.sk;
		}
		else if (province === "yt") {
			provincialTaxRate = allTaxRates.yt;
		}
		return provincialTaxRate;
	}

	function calcTax (yearIncome, taxObj)	{
		let tax=0;
		let index;
		taxObj.taxBracket.forEach((bracket) => {
			index = taxObj.taxBracket.indexOf(bracket);
			if ((bracket < yearIncome) && (yearIncome <= taxObj.taxBracket[index+1]))	{
				let i=index;
				tax = (yearIncome - bracket)*taxObj.taxRate[index];
				for (t=0; t < index; t++)	{
					i=i-1;
					tax = tax + (taxObj.taxBracket[i+1] - taxObj.taxBracket[i])*taxObj.taxRate[i];
				}
			}
		});
		return tax;
	}
});