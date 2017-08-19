// holds data for a single cell
CS.Cell = function(str,tilenr,img_trans,directional,mask,dir,initexpr,
should_anim) {
	this.str=str; /* String  */
	this.tilenr=tilenr; /* int  */
	this.img_trans=img_trans; /* int [0,7]  */
	this.directional=directional; /* string  */
	this.mask=mask; /* long  */
	this.dir=dir; /* int  */
	this.initexpr=initexpr; /* String  */
	this.anims = {}; /* type + srccell+dstcell
	                    -> {type,srcmask,dstmask,bgtile,dir,speed,frames} */
	this.should_anim = should_anim;
}

