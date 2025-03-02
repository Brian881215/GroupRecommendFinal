package com.example.GroupRecommend.utility;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import java.util.ArrayList;


@Getter
@Setter
public class Storage {
	//暫存tki數值的class

	private int competing=0;
	private int collaborating=0;
	private int compromising=0;
	private int avoiding=0;
	private int accommodating=0;
	private double TKI_score=0;

	private double pCompeting=0;
	private double pCollaborating=0;
	private double pCompromising=0;
	private double pAvoiding=0;
	private double pAccommodating=0;
	
	private ArrayList<String> arrQuestion = new ArrayList<String>();

	public void setCompeting(int i) {
		this.competing += i;
	}

	public void setCollaborating(int i) {
		this.collaborating += i;
	}

	public void setCompromising(int i) {
		this.compromising += i;
	}

	public void setAvoiding(int i) {
		this.avoiding += i;
	}

	public void setAccommodating(int i) {
		this.accommodating += i;
	}
}
