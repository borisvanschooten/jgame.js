// generate wizard forms using jsonform


function createJsonForm(baseid,struct) {
	struct.form.push(
		{
			type: "button",
			title: "Clear form",
			onClick: function(evt) {
				$('form#'+baseid).find("input[type=text], textarea").val("");
				$('form#'+baseid).find("input[type=checkbox]").attr("checked",false);
				$('form#'+baseid).find("select").val($("#target option:first").val());
				evt.preventDefault();
			},
		},
		{
			type: "button",
			title: "Cancel",
			onClick: function(evt) {
				$('#'+baseid+'dialog').css("display","none");
				evt.preventDefault();
			},
		});
	$("form#"+baseid).jsonForm(struct)
}


