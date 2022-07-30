package io.github.alainpham.model;

import java.io.Serializable;

import javax.persistence.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;

@Entity
public class Artifact extends PanacheEntity implements Serializable{
    
    public String project;
    public String currentVersionResource;
    public String currentVersionExpression;
    public String currentVersion;

    public String coordinates;
    public String latestVersionFilter;
    public String latestVersion;
    public String latestAndGreatest;

}
