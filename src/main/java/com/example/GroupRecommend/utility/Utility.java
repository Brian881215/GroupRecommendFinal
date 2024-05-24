package com.example.GroupRecommend.utility;
import javax.persistence.Entity;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;


public class Utility {
	
	// csvFile = "/Users/huangchengen/eclipse-workspace_ee/GroupRecommend/TKI_Brian_Testing.csv";
//	public void updateTKI(String csvFile) {
//		ArrayList<Storage> tempDB = new ArrayList<Storage>();
//	    ArrayList<String[]> arr = new ArrayList<String[]>();
//        try (BufferedReader br = new BufferedReader(new FileReader(csvFile))) {
//            String line;
//            while ((line = br.readLine()) != null) {
//            	if(line.contains("A") || line.contains("B")) {
//	                String[] data = line.split(",");
//	                arr.add(data);
//	                Storage storage = new Storage();
//	                // process the data
//	                for (int i = 0;i<31;i++) {
////		                    System.out.println(data[i]);
//	                	storage.getArrQuestion().add(data[i]);
//	                }
//	                //去計算當前storage那筆問卷紀錄的資料
//	                calFiveMode(storage);
//
//	                System.out.printf("TKI five mode: \nCompeting:%d, Collaborating:%d, Compromising:%d"
//	                		+ ", Avoiding:%d, Accommodating:%d\n",storage.getCompeting(),
//	                		storage.getCollaborating(),storage.getCompromising(),
//	                		storage.getAvoiding(),storage.getAccommodating());
//	                //去計算當前storage那筆問卷紀錄的最後TKI各項分數與綜合分數
//	                calTKIScore(storage);
//	                System.out.printf("TKI five mode percentage: \npCompeting:%.3f, pCollaborating:%.3f, pCompromising:%.3f"
//	                		+ ", pAvoiding:%.3f, pAccommodating:%.3f\n",storage.getpCompeting(),
//	                		storage.getpCollaborating(),storage.getpCompromising(),
//	                		storage.getpAvoiding(),storage.getpAccommodating());
//	                //計算最後零到一之間的TKI值
//	                calTKI_TotalScore(storage);
//	                System.out.println("Total TKI score:"+storage.getTKI_socre());
//	                //存進去暫存的資料庫
//	                tempDB.add(storage);
//            	}
//            }
//        }catch (IOException e) {
//            e.printStackTrace();
//        }
//	}
	public double updateTKI(ArrayList<String[]> arr) {

		Storage storage = new Storage();
		for (int i = 0;i<30;i++) {
			System.out.print(" "+arr.get(i)[1]);
			storage.getArrQuestion().add(arr.get(i)[1]);
		}
		calFiveMode(storage);
		System.out.println("Testing:"+storage.getAccommodating());
		calTKIScore(storage);
		calTKI_TotalScore(storage);
		System.out.println(" My tki score:"+storage.getTKI_score());

		return storage.getTKI_score();
	}
	public static void calFiveMode(Storage s) {
		System.out.println("size:"+s.getArrQuestion().size());
		for(int i = 0; i<s.getArrQuestion().size();i++) {
			System.out.println(s.getArrQuestion().get(i).toString());
			switch(i) {
				case 0:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setAvoiding(1);
					else
						s.setAccommodating(1);
					break;
				case 1:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setCompromising(1);
					else
						s.setCollaborating(1);
					break;
				case 2:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setCompeting(1);
					else
						s.setAccommodating(1);
					break;
				case 3:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setCompromising(1);
					else
						s.setAccommodating(1);
					break;
				case 4:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setCollaborating(1);
					else
						s.setAvoiding(1);
					break;
				case 5:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setAvoiding(1);
					else
						s.setCompeting(1);
					break;
				case 6:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setAvoiding(1);
					else
						s.setCompromising(1);
					break;
				case 7:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setCompeting(1);
					else
						s.setCollaborating(1);
					break;
				case 8:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setAvoiding(1);
					else
						s.setCompeting(1);
					break;
				case 9:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setCompeting(1);
					else
						s.setCompromising(1);
					break;
				case 10:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setCollaborating(1);
					else
						s.setAccommodating(1);
					break;
				case 11:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setAvoiding(1);
					else
						s.setCompromising(1);
					break;
				case 12:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setCompromising(1);
					else
						s.setCompeting(1);
					break;
				case 13:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setCollaborating(1);
					else
						s.setCompeting(1);
					break;
				case 14:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setAccommodating(1);
					else
						s.setAvoiding(1);
					break;
				case 15:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setAccommodating(1);
					else
						s.setCompeting(1);
					break;
				case 16:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setCompeting(1);
					else
						s.setAvoiding(1);
					break;
				case 17:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setAccommodating(1);
					else
						s.setCompromising(1);
					break;
				case 18:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setCollaborating(1);
					else
						s.setAvoiding(1);
					break;
				case 19:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setCollaborating(1);
					else
						s.setCompromising(1);
					break;
				case 20:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setAccommodating(1);
					else
						s.setCollaborating(1);
					break;
				case 21:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setCompromising(1);
					else
						s.setCompeting(1);
					break;
				case 22:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setAvoiding(1);
					else
						s.setCollaborating(1);
					break;
				case 23:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setAccommodating(1);
					else
						s.setCompromising(1);
					break;
				case 24:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setCompeting(1);
					else
						s.setAccommodating(1);
					break;
				case 25:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setCompromising(1);
					else
						s.setCollaborating(1);
					break;
				case 26:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setAvoiding(1);
					else
						s.setAccommodating(1);
					break;
				case 27:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setCompeting(1);
					else
						s.setCollaborating(1);
					break;
				case 28:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setCompromising(1);
					else
						s.setAvoiding(1);
					break;
				case 29:
					if(s.getArrQuestion().get(i).toString().contains("A"))
						s.setAccommodating(1);
					else
						s.setCollaborating(1);
					break;
			}
		}
	}
	public static void calTKIScore(Storage s) {
		int score_competing = s.getCompeting();
		int score_collaborating = s.getCollaborating();
		int score_compromising = s.getCompromising();
		int score_avoiding = s.getAvoiding();
		int score_accommodating = s.getAccommodating();
		System.out.print(" "+score_competing+" "+score_collaborating+" "+score_compromising+" "+score_avoiding+" "+score_accommodating);
		switch(score_competing) {
			case 0:
				s.setPCompeting(0.03);
				break;
			case 1:
				s.setPCompeting(0.1);
				break;
			case 2:
				s.setPCompeting(0.2);
				break;
			case 3:
				s.setPCompeting(0.31);
				break;
			case 4:
				s.setPCompeting(0.44);
				break;
			case 5:
				s.setPCompeting(0.57);
				break;
			case 6:
				s.setPCompeting(0.69);
				break;
			case 7:
				s.setPCompeting(0.79);
				break;
			case 8:
				s.setPCompeting(0.87);
				break;
			case 9:
				s.setPCompeting(0.93);
				break;
			case 10:
				s.setPCompeting(0.96);
				break;
			case 11:
				s.setPCompeting(0.98);
				break;
			case 12:
				s.setPCompeting(1);
				break;
		}
		switch(score_collaborating) {
			case 0:
				s.setPCollaborating(0);
				break;
			case 1:
				s.setPCollaborating(0.02);
				break;
			case 2:
				s.setPCollaborating(0.04);
				break;
			case 3:
				s.setPCollaborating(0.07);
				break;
			case 4:
				s.setPCollaborating(0.15);
				break;
			case 5:
				s.setPCollaborating(0.26);
				break;
			case 6:
				s.setPCollaborating(0.41);
				break;
			case 7:
				s.setPCollaborating(0.585);
				break;
			case 8:
				s.setPCollaborating(0.74);
				break;
			case 9:
				s.setPCollaborating(0.87);
				break;
			case 10:
				s.setPCollaborating(0.95);
				break;
			case 11:
				s.setPCollaborating(0.98);
				break;
			case 12:
				s.setPCollaborating(1);
				break;
		}
		switch(score_compromising) {
			case 0:
				s.setPCompromising(0);
				break;
			case 1:
				s.setPCompromising(0);
				break;
			case 2:
				s.setPCompromising(0.02);
				break;
			case 3:
				s.setPCompromising(0.04);
				break;
			case 4:
				s.setPCompromising(0.07);
				break;
			case 5:
				s.setPCompromising(0.15);
				break;
			case 6:
				s.setPCompromising(0.27);
				break;
			case 7:
				s.setPCompromising(0.41);
				break;
			case 8:
				s.setPCompromising(0.582);
				break;
			case 9:
				s.setPCompromising(0.74);
				break;
			case 10:
				s.setPCompromising(0.87);
				break;
			case 11:
				s.setPCompromising(0.95);
				break;
			case 12:
				s.setPCompromising(0.99);
				break;
		}
		switch(score_avoiding) {
			case 0:
				s.setPAvoiding(0.01);
				break;
			case 1:
				s.setPAvoiding(0.03);
				break;
			case 2:
				s.setPAvoiding(0.06);
				break;
			case 3:
				s.setPAvoiding(0.127);
				break;
			case 4:
				s.setPAvoiding(0.23);
				break;
			case 5:
				s.setPAvoiding(0.34);
				break;
			case 6:
				s.setPAvoiding(0.49);
				break;
			case 7:
				s.setPAvoiding(0.65);
				break;
			case 8:
				s.setPAvoiding(0.78);
				break;
			case 9:
				s.setPAvoiding(0.88);
				break;
			case 10:
				s.setPAvoiding(0.95);
				break;
			case 11:
				s.setPAvoiding(0.98);
				break;
			case 12:
				s.setPAvoiding(1);
				break;
		}
		switch(score_accommodating) {
			case 0:
				s.setPAccommodating(0);
				break;
			case 1:
				s.setPAccommodating(0.03);
				break;
			case 2:
				s.setPAccommodating(0.06);
				break;
			case 3:
				s.setPAccommodating(0.16);
				break;
			case 4:
				s.setPAccommodating(0.3);
				break;
			case 5:
				s.setPAccommodating(0.46);
				break;
			case 6:
				s.setPAccommodating(0.62);
				break;
			case 7:
				s.setPAccommodating(0.76);
				break;
			case 8:
				s.setPAccommodating(0.87);
				break;
			case 9:
				s.setPAccommodating(0.94);
				break;
			case 10:
				s.setPAccommodating(0.98);
				break;
			case 11:
				s.setPAccommodating(1);
				break;
			case 12:
				s.setPAccommodating(1);
				break;
		}
	}
	public void  calTKI_TotalScore(Storage s){
		System.out.println("five mode value:"+s.getPCompeting()+" "+s.getPAccommodating()+" "+s.getPCollaborating()+" "+s.getPAvoiding()+" "+s.getPCompromising());
		double assertiveness = 0;
		double cooperativeness = 0;
		//介在0.25 到0.75之間的都不算分數
		if(s.getPCompeting()>0.75) {
			assertiveness += 0.4;
			cooperativeness += -0.2;
		}
		if(s.getPCompeting()<0.25) {
			assertiveness += -0.2;
			cooperativeness += 0;
		}
		if(s.getPCollaborating()>0.75) {
			assertiveness += 0.4;
			cooperativeness += 0.2;
		}
		if(s.getPCollaborating()<0.25) {
			assertiveness += -0.1;
			cooperativeness += -0.1;
		}
		if(s.getPAccommodating()>0.75) {
			assertiveness += -0.2;
			cooperativeness += 0.4;
		}
		if(s.getPAccommodating()<0.25) {
			assertiveness += 0;
			cooperativeness += -0.1;
		}
		if(s.getPAvoiding()>0.75) {
			assertiveness += -0.4;
			cooperativeness += -0.4;
		}
		if(s.getPAvoiding()<0.25) {
			assertiveness += 0.2;
			cooperativeness += 0.2;
		}
		if(s.getPCompromising()>0.75) {
			assertiveness += 0;
			cooperativeness += 0;
		}
		if(s.getPCompromising()<0.25) {
			assertiveness += 0;
			cooperativeness += 0;
		}
		
		s.setTKI_score((1+assertiveness - cooperativeness)/2.0);
		}
	}

