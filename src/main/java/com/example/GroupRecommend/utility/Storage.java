package com.example.GroupRecommend.utility;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import java.util.ArrayList;


@Getter
@Setter
public class Storage {

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
	
//	public int getCompeting() {
//		return competing;
//	}
//
//	public int getCollaborating() {
//		return collaborating;
//	}
//
//	public int getCompromising() {
//		return compromising;
//	}
//
//	public int getAvoiding() {
//		return avoiding;
//	}
//
//	public int getAccommodating() {
//		return accommodating;
//	}
//
//	public ArrayList<String> getArrQuestion(){
//		return arrQuestion;
//	}
//
//	public double getTKI_socre() {
//		return TKI_score;
//	}
//
//	public double getpCompeting() {
//		return pCompeting;
//	}
//
//	public double getpCollaborating() {
//		return pCollaborating;
//	}
//
//	public double getpCompromising() {
//		return pCompromising;
//	}
//
//	public double getpAvoiding() {
//		return pAvoiding;
//	}
//
//	public double getpAccommodating() {
//		return pAccommodating;
//	}
//
//
//	public void setTKI_score(double i) {
//		this.TKI_score = i;
//	}

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
//	public void setpCompeting(double pCompeting) {
//		this.pCompeting = pCompeting;
//	}
//
//	public void setpCollaborating(double pCollaborating) {
//		this.pCollaborating = pCollaborating;
//	}
//
//	public void setpCompromising(double pCompromising) {
//		this.pCompromising = pCompromising;
//	}
//
//	public void setpAvoiding(double pAvoiding) {
//		this.pAvoiding = pAvoiding;
//	}
//
//	public void setpAccommodating(double pAccommodating) {
//		this.pAccommodating = pAccommodating;
//	}
//
//	public void setArrQuestion(ArrayList<String> arrQuestion) {
//		this.arrQuestion = arrQuestion;
//	}
}
