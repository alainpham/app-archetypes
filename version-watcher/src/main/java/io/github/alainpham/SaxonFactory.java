package io.github.alainpham;

import javax.enterprise.context.Dependent;
import javax.enterprise.inject.Produces;
import javax.xml.xpath.XPathFactory;

import net.sf.saxon.xpath.XPathFactoryImpl;


@Dependent
public class SaxonFactory {
    
    @Produces
    public XPathFactory saxonXPathFactory = new XPathFactoryImpl();
    
}
